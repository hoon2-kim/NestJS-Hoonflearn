import { CategoryCourseEntity } from '@src/category_course/entities/category-course.entitiy';

export const mockCategoryCourse = [
  {
    id: 'uuid1',
    fk_parent_category_id: 'uuid',
    fk_sub_category_id: 'uuid',
    fk_course_id: 'uuid',
    isMain: true,
  },
  {
    id: 'uuid2',
    fk_parent_category_id: 'uuid',
    fk_sub_category_id: 'uuid',
    fk_course_id: 'uuid',
    isMain: false,
  },
] as CategoryCourseEntity[];

export const mockCategoryCourseRepository = {
  save: jest.fn(),
};
