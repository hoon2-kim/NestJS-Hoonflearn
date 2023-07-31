import { UseGuards } from '@nestjs/common';
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AtGuard } from 'src/auth/guards/at.guard';
import { CartService } from './cart.service';
import { CreateCartDto } from './dtos/create-cart.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(AtGuard)
  findCartByUser(
    @CurrentUser('id') userId: string, //
  ) {
    return this.cartService.findMyCart(userId);
  }

  @Post()
  @UseGuards(AtGuard)
  insertCartInCart(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cartService.create(createCartDto, userId);
  }

  // TODO : 선택삭제를 위한 DELETE 대신 POST 고려
  @Delete('courses/:courseId')
  @UseGuards(AtGuard)
  deleteCourseInCart(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cartService.delete(courseId, userId);
  }
}
