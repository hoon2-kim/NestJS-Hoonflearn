import { UseGuards } from '@nestjs/common';
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { AtGuard } from '@src/auth/guards/at.guard';
import { CartService } from '@src/cart/cart.service';
import {
  ApiDeleteCourseInCartSwagger,
  ApiGetMyCartSwagger,
  ApiInsertCourseInCartSwagger,
} from '@src/cart/cart.swagger';
import { CreateCartDto } from '@src/cart/dtos/create-cart.dto';
import { CartEntity } from '@src/cart/entities/cart.entity';

@ApiTags('CART')
@UseGuards(AtGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiGetMyCartSwagger('내 장바구니 조회')
  @Get()
  async findCartByUser(
    @CurrentUser('id') userId: string, //
  ): Promise<CartEntity> {
    return await this.cartService.findMyCart(userId);
  }

  @ApiInsertCourseInCartSwagger('장바구니에 강의 담기')
  @Post()
  async insertCourseInCart(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser('id') userId: string,
  ): Promise<CartEntity> {
    return await this.cartService.create(createCartDto, userId);
  }

  /** 고민 : 선택삭제를 위한 DELETE 대신 POST 고려 */
  @ApiDeleteCourseInCartSwagger('장바구니의 강의 삭제')
  @Delete('courses/:courseId')
  async deleteCourseInCart(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.cartService.delete(courseId, userId);
  }
}
