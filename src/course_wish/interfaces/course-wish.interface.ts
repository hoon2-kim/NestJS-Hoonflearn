import { ECourseLevelType } from '@src/course/enums/course.enum';
import { ISimpleUserResponse } from '@src/user/interfaces/user.interface';

export interface IWishCourseListResponse {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  averageRating: number;
  students: number;
  level: ECourseLevelType;
  instructor: ISimpleUserResponse;
}
