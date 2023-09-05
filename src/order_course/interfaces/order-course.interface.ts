import { IOrderDetailCourseResponse } from 'src/course/interfaces/course.interface';

export interface IOrderCourseResponse {
  id: string;
  orderPrice: number;
  course: IOrderDetailCourseResponse;
}
