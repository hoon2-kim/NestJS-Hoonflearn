import { ApiProperty } from '@nestjs/swagger';
import { OrderDetailCourseResponseDto } from 'src/course/dtos/response/course.response';
import { IOrderDetailCourseResponse } from 'src/course/interfaces/course.interface';
import { OrderCourseEntity } from 'src/order_course/entities/order-course.entity';
import { IOrderCourseResponse } from 'src/order_course/interfaces/order-course.interface';

export class OrderCourseResponseDto implements IOrderCourseResponse {
  @ApiProperty({ description: '주문 상세 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '주문 개별 가격', type: 'number' })
  orderPrice: number;

  @ApiProperty({
    description: '주문한 강의 정보',
    type: OrderDetailCourseResponseDto,
  })
  course: IOrderDetailCourseResponse;

  static from(orderCourse: OrderCourseEntity): OrderCourseResponseDto {
    const dto = new OrderCourseResponseDto();
    const { id, orderPrice, course } = orderCourse;

    dto.id = id;
    dto.orderPrice = orderPrice;
    dto.course = OrderDetailCourseResponseDto.from(course);

    return dto;
  }
}
