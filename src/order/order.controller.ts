import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrderService } from '@src/order/order.service';
import { CreateOrderDto } from '@src/order/dtos/create-order.dto';
import { AtGuard } from '@src/auth/guards/at.guard';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { OrderListQueryDto } from '@src/order/dtos/order-list.query.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCompleteOrderSwagger,
  ApiGetMyOrderDetailSwagger,
  ApiGetMyOrdersSwagger,
} from '@src/order/order.swagger';
import { PageDto } from '@src/common/dtos/page.dto';
import { OrderEntity } from '@src/order/entities/order.entity';

@ApiTags('ORDER')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiGetMyOrdersSwagger('내 주문내역 조회')
  @Get()
  @UseGuards(AtGuard)
  async findMyOrders(
    @Query() orderListQueryDto: OrderListQueryDto,
    @CurrentUser('id') userId: string,
  ): Promise<PageDto<OrderEntity>> {
    return await this.orderService.findOrders(orderListQueryDto, userId);
  }

  @ApiGetMyOrderDetailSwagger('주문내역 상세 조회')
  @Get('/:orderId/detail')
  @UseGuards(AtGuard)
  async findMyOrderDetail(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
  ): Promise<OrderEntity> {
    return await this.orderService.findOrderDetail(orderId, userId);
  }

  @ApiCompleteOrderSwagger('주문 완료')
  @Post('complete')
  @UseGuards(AtGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('id') userId: string,
  ): Promise<OrderEntity> {
    return await this.orderService.create(createOrderDto, userId);
  }
}
