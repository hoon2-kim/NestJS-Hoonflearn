import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { CourseUserListResponseDto } from '@src/course_user/dtos/response/course-user.response.dto';
import { CourseUserEntity } from '@src/course_user/entities/course-user.entity';
import { ECouresUserType } from '@src/course_user/enums/course-user.enum';
import { UserMyCourseQueryDto } from '@src/user/dtos/query/user.query.dto';
import { mockCreatedCourse } from '@test/__mocks__/course.mock';

export const mockCreatedCourseUserWithFree = {
  id: 'uuid',
  fk_course_id: 'uuid',
  fk_user_id: 'uuid',
  type: ECouresUserType.Free,
  created_at: new Date('2023-10'),
} as CourseUserEntity;

export const mockCreatedCourseUserWithPaid = {
  ...mockCreatedCourseUserWithFree,
  type: ECouresUserType.Paid,
} as CourseUserEntity;

export const mockCourseUser = [
  [
    {
      id: 'uuid',
      type: ECouresUserType.Paid,
      fk_user_id: 'uuid',
      fk_course_id: 'uuid',
      created_at: new Date('2023-10'),
      course: {
        ...mockCreatedCourse,
      } as CourseEntity,
    },
  ],
  1,
] as [CourseUserEntity[], number];

const pageMeta = new PageMetaDto({
  pageOptionDto: new UserMyCourseQueryDto(),
  itemCount: mockCourseUser[1],
});
export const expectedCourseUserList = new PageDto(
  mockCourseUser[0].map((c) => CourseUserListResponseDto.from(c)),
  pageMeta,
);

export const mockCourseUserRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
  }),
  save: jest.fn(),
  findOne: jest.fn(),
};
