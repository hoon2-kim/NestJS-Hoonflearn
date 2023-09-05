import { ApiProperty } from '@nestjs/swagger';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { ICartResponse } from 'src/cart/interfaces/cart.interface';
import { CartCourseResponseDto } from 'src/course/dtos/response/course.response';
import { ICartCourseResponse } from 'src/course/interfaces/course.interface';

export class CartResponseDto implements ICartResponse {
  @ApiProperty({ description: '카트 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '카트에 담긴 강의들의 총 가격', type: 'number' })
  total_price: number;

  @ApiProperty({
    description: '카트에 담긴 강의 정보',
    type: CartCourseResponseDto,
    isArray: true,
  })
  course: ICartCourseResponse[];

  static from(cart: CartEntity, total_price: number): CartResponseDto {
    const dto = new CartResponseDto();
    const { id, cartsCourses } = cart;

    dto.id = id;
    dto.total_price = total_price;
    dto.course = cartsCourses.map((c) => CartCourseResponseDto.from(c.course));

    return dto;
  }
}
