import { CreateCartDto } from '@src/cart/dtos/request/create-cart.dto';
import { CartResponseDto } from '@src/cart/dtos/response/cart.response.dto';
import { CartEntity } from '@src/cart/entities/cart.entity';
import { CartCourseEntity } from '@src/cart_course/entities/cart-course.entity';
import { CourseEntity } from '@src/course/entities/course.entity';
import { UserEntity } from '@src/user/entities/user.entity';
import { mockCourse } from '@test/__mocks__/course.mock';
import { mockCreatedInstructor } from '@test/__mocks__/user.mock';

export const mockCreateCartDto: CreateCartDto = {
  courseId: 'uuid',
};

export const mockCreatedCart = {
  id: 'uuid',
  fk_user_id: 'uuid',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
} as CartEntity;

export const mockCart = {
  ...mockCreatedCart,
  cartsCourses: [
    {
      id: 'uuid',
      fk_cart_id: 'uuid',
      fk_course_id: 'uuid',
      created_at: new Date('2023-10'),
      course: {
        ...mockCourse,
        instructor: {
          ...mockCreatedInstructor,
        } as UserEntity,
      } as CourseEntity,
    },
  ] as CartCourseEntity[],
} as CartEntity;

export const expectedMyCart = CartResponseDto.from(mockCart, 10000);

export const mockCartRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

export const mockCartCourseService = {
  insertCourseInCart: jest.fn(),
  deleteCourseInCart: jest.fn(),
};

export const mockCourseService = {
  calculateCoursePriceInCart: jest.fn(),
  findOneByOptions: jest.fn(),
};

export const mockCourseUserService = {
  checkBoughtCourseByUser: jest.fn(),
};

export const mockCartService = {
  findMyCart: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};
