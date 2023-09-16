import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/request/create-order.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { OrderListQueryDto } from './dtos/query/order-list.query.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCompleteOrderSwagger,
  ApiGetMyOrderDetailSwagger,
  ApiGetMyOrdersSwagger,
} from './order.swagger';
import { PageDto } from 'src/common/dtos/page.dto';
import {
  OrderDetailResponseDto,
  OrdersResponseDto,
} from './dtos/response/order.response.dto';
import { OrderEntity } from './entities/order.entity';

@ApiTags('ORDER')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiGetMyOrdersSwagger('내 주문내역 조회')
  @Get()
  @UseGuards(AtGuard)
  findMyOrders(
    @Query() orderListQueryDto: OrderListQueryDto,
    @CurrentUser('id') userId: string,
  ): Promise<PageDto<OrdersResponseDto>> {
    return this.orderService.findOrders(orderListQueryDto, userId);
  }

  @ApiGetMyOrderDetailSwagger('주문내역 상세 조회')
  @Get('/:orderId/detail')
  @UseGuards(AtGuard)
  findMyOrderDetail(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
  ): Promise<OrderDetailResponseDto> {
    return this.orderService.findOrderDetail(orderId, userId);
  }

  @ApiCompleteOrderSwagger('주문 완료')
  @Post('complete')
  @UseGuards(AtGuard)
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('id') userId: string,
  ): Promise<OrderEntity> {
    return this.orderService.create(createOrderDto, userId);
  }
}
