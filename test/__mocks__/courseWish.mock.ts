import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { CourseWishListResponseDto } from '@src/course_wish/dtos/response/course-wish.reponse.dto';
import { CourseWishEntity } from '@src/course_wish/entities/course-wish.entity';
import { UserWishQueryDto } from '@src/user/dtos/query/user.query.dto';
import { mockCreatedCourse } from './course.mock';

export const mockCreatedCourseWish = {
  id: 'uuid',
  fk_user_id: 'uuid',
  fk_course_id: 'uuid',
  created_at: new Date('2023-10'),
} as CourseWishEntity;

export const mockCourseWish = [
  [
    {
      id: 'uuid',
      fk_user_id: 'uuid',
      fk_course_id: 'uuid',
      created_at: new Date('2023-10'),
      course: {
        ...mockCreatedCourse,
      } as CourseEntity,
    },
  ],
  1,
] as [CourseWishEntity[], number];

const pageMeta = new PageMetaDto({
  pageOptionDto: new UserWishQueryDto(),
  itemCount: mockCourseWish[1],
});
export const expectedCourseWishList = new PageDto(
  mockCourseWish[0].map((c) => CourseWishListResponseDto.from(c)),
  pageMeta,
);

export const mockCourseWishRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
  }),
};
