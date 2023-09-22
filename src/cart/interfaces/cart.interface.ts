import { ICartCourseResponse } from '@src/course/interfaces/course.interface';

export interface ICartResponse {
  id: string;
  total_price: number;
  course: ICartCourseResponse[];
}
