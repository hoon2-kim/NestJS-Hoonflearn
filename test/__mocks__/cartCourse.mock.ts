import { CartCourseEntity } from '@src/cart_course/entities/cart-course.entity';

export const mockCartCourse = {
  id: 'uuid',
  fk_course_id: 'uuid',
  fk_cart_id: 'uuid',
  created_at: new Date('2023-10'),
} as CartCourseEntity;

export const mockCartCourseRepository = {
  save: jest.fn(),
  delete: jest.fn(),
};

export const mockCourseService = {
  findOneByOptions: jest.fn(),
};
