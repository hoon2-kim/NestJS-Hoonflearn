import { UseGuards } from '@nestjs/common';
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AtGuard } from 'src/auth/guards/at.guard';
import { CartService } from './cart.service';
import {
  ApiDeleteCourseInCartSwagger,
  ApiGetMyCartSwagger,
  ApiInsertCourseInCartSwagger,
} from './cart.swagger';
import { CreateCartDto } from './dtos/request/create-cart.dto';
import { CartResponseDto } from './dtos/response/cart.response.dto';
import { CartEntity } from './entities/cart.entity';

@ApiTags('CART')
@UseGuards(AtGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiGetMyCartSwagger('내 장바구니 조회')
  @Get()
  findCartByUser(
    @CurrentUser('id') userId: string, //
  ): Promise<CartResponseDto> {
    return this.cartService.findMyCart(userId);
  }

  @ApiInsertCourseInCartSwagger('장바구니에 강의 담기')
  @Post()
  insertCourseInCart(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser('id') userId: string,
  ): Promise<CartEntity> {
    return this.cartService.create(createCartDto, userId);
  }

  /** 선택삭제를 위한 DELETE 대신 POST 고려 */
  @ApiDeleteCourseInCartSwagger('장바구니의 강의 삭제')
  @Delete('courses/:courseId')
  deleteCourseInCart(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.cartService.delete(courseId, userId);
  }
}
