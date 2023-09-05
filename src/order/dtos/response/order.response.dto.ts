import { ApiProperty } from '@nestjs/swagger';
import { OrderEntity } from 'src/order/entities/order.entity';
import { EOrderStatus } from 'src/order/enums/order.enum';
import {
  IOrderDetailResponse,
  IOrdersResponse,
} from 'src/order/interfaces/order.interface';
import { OrderCourseResponseDto } from 'src/order_course/dtos/response/order-course.response.dto';
import { IOrderCourseResponse } from 'src/order_course/interfaces/order-course.interface';

export class OrdersResponseDto implements IOrdersResponse {
  @ApiProperty({ description: '주문 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '주문 번호', type: 'string' })
  merchant_uid: string;

  @ApiProperty({ description: '주문 이름', type: 'string' })
  orderName: string;

  @ApiProperty({
    description: '주문 상태',
    enum: EOrderStatus,
    enumName: 'EOrderStatus',
  })
  orderStatus: EOrderStatus;

  @ApiProperty({ description: '주문 총 금액', type: 'number' })
  totalOrderPrice: number;

  @ApiProperty({
    description: '주문 날짜',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  static from(order: OrderEntity): OrdersResponseDto {
    const dto = new OrdersResponseDto();
    const {
      id,
      merchant_uid,
      orderName,
      orderStatus,
      totalOrderPrice,
      created_at,
    } = order;

    dto.id = id;
    dto.merchant_uid = merchant_uid;
    dto.orderName = orderName;
    dto.orderStatus = orderStatus;
    dto.totalOrderPrice = totalOrderPrice;
    dto.created_at = created_at;

    return dto;
  }
}

export class OrderDetailResponseDto implements IOrderDetailResponse {
  @ApiProperty({ description: '주문 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '주문 번호', type: 'string' })
  merchant_uid: string;

  @ApiProperty({
    description: '주문 상태',
    enum: EOrderStatus,
    enumName: 'EOrderStatus',
  })
  orderStatus: EOrderStatus;

  @ApiProperty({ description: '주문 결제 수단', type: 'string' })
  paymentMethod: string;

  @ApiProperty({ description: '주문 총 금액', type: 'number' })
  totalOrderPrice: number;

  @ApiProperty({
    description: '주문 상세 정보',
    type: OrderCourseResponseDto,
    isArray: true,
  })
  order_course: IOrderCourseResponse[];

  static from(order: OrderEntity): OrderDetailResponseDto {
    const dto = new OrderDetailResponseDto();
    const {
      id,
      merchant_uid,
      orderStatus,
      paymentMethod,
      totalOrderPrice,
      ordersCourses,
    } = order;

    dto.id = id;
    dto.merchant_uid = merchant_uid;
    dto.orderStatus = orderStatus;
    dto.paymentMethod = paymentMethod;
    dto.totalOrderPrice = totalOrderPrice;
    dto.order_course = ordersCourses.map((o) => OrderCourseResponseDto.from(o));

    return dto;
  }
}
