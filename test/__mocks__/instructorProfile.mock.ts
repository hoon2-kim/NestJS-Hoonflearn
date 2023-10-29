import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseListByInstructorResponseDto } from '@src/course/dtos/response/course.response';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { InstructorCourseQueryDto } from '@src/instructor/dtos/query/instructor.query.dto';
import { CreateInstructorDto } from '@src/instructor/dtos/request/create-instructor.dto';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { EFieldOfHopeType } from '@src/instructor/enums/instructor.enum';
import { UserEntity } from '@src/user/entities/user.entity';
import { mockCreatedInstructor } from '@test/__mocks__/user.mock';

export const mockCreateInstructorDto: CreateInstructorDto = {
  contactEmail: 'a@a.com',
  aboutMe: '',
  fieldOfHope: EFieldOfHopeType.AcademicForeignLanguage,
  nameOrBusiness: '',
  link: '',
};

export const mockInstructorProfile = {
  id: 'uuid',
  contactEmail: 'a@a.com',
  nameOrBusiness: '가나다',
  fieldOfHope: EFieldOfHopeType.DevProgram,
  aboutMe: '크크크',
  link: '링크',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  deleted_at: null,
  fk_user_id: mockCreatedInstructor.id,
} as InstructorProfileEntity;

export const mockMadeMyCourse: UserEntity[] = [
  {
    ...mockCreatedInstructor,
    madeCourses: [
      {
        id: 'uuid',
        title: '강의1',
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
        students: 0,
        created_at: new Date('2023-10'),
        updated_at: new Date('2023-10'),
        fk_instructor_id: 'uuid',
      } as CourseEntity,
      {
        id: 'uuid',
        title: '강의2',
        learnable: [],
        recommendedFor: [],
        prerequisite: [],
        level: ECourseLevelType.IntermediateLevelOrHigher,
        summary: '두줄요약',
        description: '설명',
        price: 20000,
        coverImage: null,
        averageRating: 0.0,
        reviewCount: 0,
        wishCount: 0,
        totalVideosTime: 0,
        totalLessonCount: 0,
        students: 0,
        created_at: new Date('2023-10'),
        updated_at: new Date('2023-10'),
        fk_instructor_id: 'uuid',
      } as CourseEntity,
    ],
  },
];

const responseData = mockMadeMyCourse.flatMap((u) =>
  u.madeCourses.map((c) => {
    return CourseListByInstructorResponseDto.from(c, 10);
  }),
);
const pageMeta = new PageMetaDto({
  pageOptionDto: new InstructorCourseQueryDto(),
  itemCount: responseData.length,
});
export const expectedCourseByInstructor = new PageDto(responseData, pageMeta);

export const mockInstructor: InstructorProfileEntity = {
  ...mockInstructorProfile,
  user: { id: 'uuid' } as UserEntity,
};

export const mockInstructorRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

export const mockUserRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(), // this는 createQueryBuilder를 가리킨다.
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
};

export const mockUserService = {
  findOneByOptions: jest.fn(),
  updateRefreshToken: jest.fn(),
};

export const mockAuthService = {
  getAccessToken: jest.fn().mockReturnValue('access'),
  getRefreshToken: jest.fn().mockReturnValue('refresh'),
  hashData: jest.fn().mockResolvedValue('hash_rt'),
};

export const mockCourseService = {
  getCourseIdsByInstructor: jest.fn(),
};

export const mockQuestionService = {
  calculateQuestionCountByCourseId: jest.fn().mockResolvedValue(10),
  findQuestionsByInstructorCourse: jest.fn(),
};

export const mockReviewService = {
  findReviewsByInstructorCourse: jest.fn(),
};

export const mockInstructorService = {
  getMyCoursesByInstructor: jest.fn(),
  getQuestionsByMyCourses: jest.fn(),
  getReviewsByMyCourses: jest.fn(),
  create: jest.fn(),
};
