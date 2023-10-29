import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { InstructorReviewQueryDto } from '@src/instructor/dtos/query/instructor.query.dto';
import { ReviewResponseWithoutCommentDto } from '@src/review/dtos/response/review.response.dto';
import { ReviewEntity } from '@src/review/entities/review.entity';
import { UserEntity } from '@src/user/entities/user.entity';
import { ERoleType } from '@src/user/enums/user.enum';

export const mockReviewWithoutComment = [
  {
    id: 'uuid',
    contents: '리뷰',
    rating: 5,
    likeCount: 0,
    fk_user_id: 'uuid',
    fk_course_id: 'uuid',
    created_at: new Date('2023-10'),
    updated_at: new Date('2023-10'),
    course: {
      id: 'uuid',
      title: '강의',
      learnable: [],
      recommendedFor: [],
      prerequisite: [],
      level: ECourseLevelType.Beginner,
      summary: '두줄요약',
      description: '설명',
      price: 10000,
      coverImage: null,
      averageRating: 0.0,
      reviewCount: 0,
      wishCount: 0,
      totalVideosTime: 0,
      totalLessonCount: 0,
      students: 100,
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      fk_instructor_id: 'uuid',
    } as CourseEntity,
    user: {
      id: 'uuid',
      email: 'a@a.com',
      nickname: '유저',
      password: '$2a$10$8t.oP/R7OVs7w0ruteW5qOrGzRNhyH8.1inzO9B18irQupUNQFp3.',
      description: null,
      phone: '01011111111',
      profileAvatar:
        'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697735522023_cat.png',
      role: ERoleType.User,
      hashedRt: '$2a$10$IjF0i12Fye9PM/0oD7NBeueWJ/wcPukUkuj7vvkcxB.fC1F3G8rH6',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      deleted_at: null,
    } as UserEntity,
  },
] as ReviewEntity[];

const pageMeta = new PageMetaDto({
  pageOptionDto: new InstructorReviewQueryDto(),
  itemCount: 10,
});
export const expectedReviewByInstructor = new PageDto(
  mockReviewWithoutComment.map((r) => ReviewResponseWithoutCommentDto.from(r)),
  pageMeta,
);

export const mockReviewWitComment = {};

export const mockReviewRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
  }),
  findOne: jest.fn(),
};

export const mockCourseService = {
  findOneByOptions: jest.fn(),
  courseReviewRatingUpdate: jest.fn(),
};

export const mockReviewLikeService = {
  toggleReviewLikeStatus: jest.fn(),
  findOneByOptions: jest.fn(),
};

export const mockCourseUserService = {
  validateBoughtCourseByUser: jest.fn(),
};
