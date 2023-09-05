import { ICategoryCourseMainNameResponse } from 'src/category_course/interfaces/category-course.interface';
import { ISectionResponse } from 'src/section/interfaces/section.interface';
import { ISimpleUserResponse } from 'src/user/interfaces/user.interface';
import { ECourseLevelType } from '../enums/course.enum';

export interface ISimpleCourseResponse {
  id: string;
  title: string;
}

export interface IOrderDetailCourseResponse {
  id: string;
  title: string;
  coverImage: string;
}

export interface ICartCourseResponse {
  id: string;
  title: string;
  coverImage: string;
  price: number;
  instructor: ISimpleUserResponse;
}

export interface ICourseIdsResponse {
  courseIds: string[];
}

export interface ICoursesTotalPrice {
  total_price: number;
}

export interface ICourseListResponse {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  averageRating: number;
  students: number;
  level: ECourseLevelType;
  instructor: ISimpleUserResponse;
}

export interface ICourseDetailCourseInfoResponse {
  id: string;
  title: string;
  learnable: string[];
  recommendedFor: string[];
  prerequisite: string[];
  level: ECourseLevelType;
  summary: string;
  description: string;
  price: number;
  coverImage: string;
  averageRating: number;
  reviewCount: number;
  wishCount: number;
  students: number;
  created_at: Date;
  instructor: ISimpleUserResponse;
  category_course: ICategoryCourseMainNameResponse[];
}

export interface ICourseDetailCourseCurriculum {
  totalVideosTime: number;
  totalLessonCount: number;
  curriculums: ISectionResponse[];
}

export interface ICourseListByInstructor {
  id: string;
  coverImage: string;
  title: string;
  averageRating: number;
  students: number;
  questionCount: number;
  // 상태
}
