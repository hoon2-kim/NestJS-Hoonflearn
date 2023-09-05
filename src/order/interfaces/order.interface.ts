import { IOrderCourseResponse } from 'src/order_course/interfaces/order-course.interface';
import { EOrderStatus } from '../enums/order.enum';

export interface IOrdersResponse {
  id: string;
  orderName: string;
  merchant_uid: string;
  totalOrderPrice: number;
  orderStatus: EOrderStatus;
  created_at: Date;
}

export interface IOrderDetailResponse {
  id: string;
  merchant_uid: string;
  totalOrderPrice: number;
  orderStatus: EOrderStatus;
  paymentMethod: string;
  order_course: IOrderCourseResponse[];
}
