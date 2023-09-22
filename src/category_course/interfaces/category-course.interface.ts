import { ICategoryNameResponse } from '@src/category/interfaces/category.interface';

export interface ICategoryCourseMainNameResponse {
  mainCategory: ICategoryNameResponse;
  subCategory: ICategoryNameResponse;
}
