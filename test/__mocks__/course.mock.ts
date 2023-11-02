import { CategoryEntity } from '@src/category/entities/category.entity';
import { CategoryCourseEntity } from '@src/category_course/entities/category-course.entitiy';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseListQueryDto } from '@src/course/dtos/query/course-list.query.dto';
import { CreateCourseDto } from '@src/course/dtos/request/create-course.dto';
import { UpdateCourseDto } from '@src/course/dtos/request/update-course.dto';
import {
  CourseDashBoardResponseDto,
  CourseDetailResponseDto,
  CourseListResponseDto,
} from '@src/course/dtos/response/course.response';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { SectionEntity } from '@src/section/entities/section.entity';
import { UserEntity } from '@src/user/entities/user.entity';
import { ERoleType } from '@src/user/enums/user.enum';
import { VideoEntity } from '@src/video/entities/video.entity';
import { mockCreatedInstructor } from '@test/__mocks__/user.mock';
import { mockCreatedQuestion } from './question.mock';

export const mockCreateCourseDto: CreateCourseDto = {
  title: '강의제목',
  learnable: ['배움1', '배움2'],
  recommendedFor: ['추천1', '추천2'],
  prerequisite: ['선수지식'],
  level: ECourseLevelType.Beginner,
  summary: '두줄요약',
  description: '설명',
  price: 10000,
  selectedCategoryIds: [
    {
      parentCategoryId: 'uuid',
      subCategoryId: 'uuid',
    },
  ],
};

export const mockUpdateCourseDto: UpdateCourseDto = {
  title: '수정',
  learnable: ['배움1', '배움2'],
  recommendedFor: ['추천1', '추천2'],
  prerequisite: ['선수지식'],
  level: ECourseLevelType.Introduction,
  summary: '수정',
  description: '수정',
};

export const mockCreatedCourse = {
  id: 'uuid',
  title: '강의1',
  learnable: ['배움1', '배움2'],
  recommendedFor: ['추천1', '추천2'],
  prerequisite: ['선수지식'],
  level: ECourseLevelType.Beginner,
  summary: '요약',
  description: '설명',
  price: 50000,
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
  instructor: {
    id: 'uuid',
    email: 'ins1@a.com',
    nickname: '강사',
    description: null,
    phone: '01012341234',
    role: ERoleType.Instructor,
    created_at: new Date('2023-10'),
    updated_at: new Date('2023-10'),
  } as UserEntity,
} as CourseEntity;

export const mockCourse = {
  id: 'uuid',
  title: '강의',
  learnable: ['배움1', '배움2'],
  recommendedFor: ['추천1', '추천2'],
  prerequisite: ['선수지식'],
  level: ECourseLevelType.Beginner,
  summary: '두줄요약',
  description: '설명',
  price: 50000,
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
} as CourseEntity;

export const mockCourses = [
  [
    {
      ...mockCourse,
      instructor: {
        ...mockCreatedInstructor,
      },
    },
  ],
  10,
] as [CourseEntity[], number];

const courseListPageMeta = new PageMetaDto({
  pageOptionDto: new CourseListQueryDto(),
  itemCount: mockCourses[1],
});

export const expectedCourseList = new PageDto(
  mockCourses[0].map((c) => CourseListResponseDto.from(c)),
  courseListPageMeta,
);

export const mockCourseDetail: CourseEntity = {
  ...mockCourse,
  instructor: {
    ...mockCreatedInstructor,
  },
  categoriesCourses: [
    {
      id: 'uuid',
      isMain: true,
      fk_course_id: 'uuid',
      fk_parent_category_id: 'uuid',
      fk_sub_category_id: 'uuid',
      parentCategory: {
        id: 'uuid',
        name: '개발/프로그래밍',
        created_at: new Date('2023-10'),
        updated_at: new Date('2023-10'),
        fk_parent_category_id: null,
      } as CategoryEntity,
      subCategory: {
        id: 'uuid',
        name: '백엔드',
        created_at: new Date('2023-10'),
        updated_at: new Date('2023-10'),
        fk_parent_category_id: 'uuid',
      } as CategoryEntity,
    },
  ] as CategoryCourseEntity[],
  sections: [
    {
      id: 'uuid',
      title: '섹션1',
      goal: '섹션목표1',
      totalSectionTime: 10000,
      totalLessonBySectionCount: 1,
      fk_course_id: 'uuid',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      lessons: [
        {
          id: 'uuid',
          title: '수업1',
          note: null,
          isFreePublic: false,
          fk_section_id: 'uuid',
          created_at: new Date('2023-10'),
          updated_at: new Date('2023-10'),
          video: {
            id: 'uuid',
            videoUrl:
              'https://hoonflearn-s3-bucket.s3.amazonaws.com/유저-4bf75ad8-563b-45a9-a027-aec7837a7053/강의-41b5dde8-07fa-4646-8b33-7dd4b0b15e0e/videos/1698828154906_고양이끼리소통API(댓글,좋아요).mp4',
            videoTime: 10000,
            fk_lesson_id: 'uuid',
            created_at: new Date('2023-10'),
          } as VideoEntity,
        },
      ] as LessonEntity[],
    },
  ] as SectionEntity[],
};

export const expectedCourseDetail =
  CourseDetailResponseDto.from(mockCourseDetail);

export const mockCourseDashBoard = {
  ...mockCourse,
  sections: [
    {
      id: 'uuid',
      title: '섹션1',
      goal: '섹션목표1',
      totalSectionTime: 10000,
      totalLessonBySectionCount: 1,
      fk_course_id: 'uuid',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      lessons: [
        {
          id: 'uuid',
          title: '수업1',
          note: null,
          isFreePublic: false,
          fk_section_id: 'uuid',
          created_at: new Date('2023-10'),
          updated_at: new Date('2023-10'),
          video: {
            id: 'uuid',
            videoUrl:
              'https://hoonflearn-s3-bucket.s3.amazonaws.com/유저-4bf75ad8-563b-45a9-a027-aec7837a7053/강의-41b5dde8-07fa-4646-8b33-7dd4b0b15e0e/videos/1698828154906_고양이끼리소통API(댓글,좋아요).mp4',
            videoTime: 10000,
            fk_lesson_id: 'uuid',
            created_at: new Date('2023-10'),
          } as VideoEntity,
        },
      ] as LessonEntity[],
    },
  ] as SectionEntity[],
} as CourseEntity;

mockCourseDashBoard.questions = [mockCreatedQuestion];

export const expectedCourseDashboard =
  CourseDashBoardResponseDto.from(mockCourseDashBoard);

export const mockCourseRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
    whereInIds: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockReturnThis(),
  }),
};

export const mockQuestionRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
};

export const mockCategoryService = {
  validateCategoryOptionalTransaction: jest.fn(),
};

export const mockCategoryCourseService = {
  linkCourseToCategories: jest.fn(),
  updateCourseToCategories: jest.fn(),
};

export const mockCourseWishService = {
  toggleCourseWishStatus: jest.fn(),
  findOneByOptions: jest.fn(),
};

export const mockAwsS3Service = {
  deleteS3Object: jest.fn(),
  uploadFileToS3: jest.fn(),
};

export const mockCourseUserService = {
  checkBoughtCourseByUser: jest.fn(),
  validateBoughtCourseByUser: jest.fn(),
};

export const mockCourseService = {
  findCourseDetail: jest.fn(),
  getStatusByUser: jest.fn(),
  getDashBoard: jest.fn(),
  findAllCourse: jest.fn(),
  create: jest.fn(),
  addOrCancelWish: jest.fn(),
  update: jest.fn(),
  uploadImage: jest.fn(),
  delete: jest.fn(),
};
