import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { InstructorQuestionQueryDto } from '@src/instructor/dtos/query/instructor.query.dto';
import { QuestionCommentEntity } from '@src/question-comment/entities/question-comment.entity';
import { CreateQuestionDto } from '@src/question/dtos/request/create-question.dto';
import { UpdateQuestionDto } from '@src/question/dtos/request/update-question.dto';
import {
  QuestionDetailResponseDto,
  QuestionListResponseDto,
} from '@src/question/dtos/response/question.response.dto';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { EQuestionStatus } from '@src/question/enums/question.enum';
import { UserQuestionQueryDto } from '@src/user/dtos/query/user.query.dto';
import { UserEntity } from '@src/user/entities/user.entity';
import { ERoleType } from '@src/user/enums/user.enum';

export const mockCreateQuestionDto: CreateQuestionDto = {
  courseId: 'uuid',
  title: '질문제목',
  contents: '질문내용',
};

export const mockUpdateQuestionDto: UpdateQuestionDto = {
  title: '수정',
  contents: '수정',
};

export const mockCreatedQuestion = {
  id: 'uuid',
  title: '질문제목',
  contents: '질문내용',
  fk_course_id: 'uuid',
  fk_user_id: 'uuid',
  questionStatus: EQuestionStatus.UnResolved,
  voteCount: 0,
  views: 0,
  commentCount: 0,
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
} as QuestionEntity;

export const mockQuestionsWithOutComment = [
  [
    {
      id: 'uuid',
      title: '질문제목',
      contents: '질문내용',
      questionStatus: EQuestionStatus.UnResolved,
      voteCount: 0,
      views: 0,
      commentCount: 0,
      fk_course_id: 'uuid',
      fk_user_id: 'uuid',
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
        price: 0,
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
      user: {
        id: 'uuid',
        email: 'a@a.com',
        nickname: '유저',
        password:
          '$2a$10$8t.oP/R7OVs7w0ruteW5qOrGzRNhyH8.1inzO9B18irQupUNQFp3.',
        description: null,
        phone: '01011111111',
        profileAvatar:
          'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697735522023_cat.png',
        role: ERoleType.User,
        hashedRt:
          '$2a$10$VVPxFdJkwrC.pWGEc5baxuMY0tzrx8rX7mS1ztqN0lc4ujTWeIYju',
        created_at: new Date('2023-10'),
        updated_at: new Date('2023-10'),
        deleted_at: null,
      } as UserEntity,
    },
  ],
  10,
] as [QuestionEntity[], number];

const pageMeta = new PageMetaDto({
  pageOptionDto: new InstructorQuestionQueryDto(),
  itemCount: mockQuestionsWithOutComment[1],
});
export const expectedQuestionWithoutComment = new PageDto(
  mockQuestionsWithOutComment[0].map((q) => QuestionListResponseDto.from(q)),
  pageMeta,
);

const pageMetaTake20 = new PageMetaDto({
  pageOptionDto: new UserQuestionQueryDto(),
  itemCount: mockQuestionsWithOutComment[1],
});
export const expectedMyQuestionWithoutComment = new PageDto(
  mockQuestionsWithOutComment[0].map((q) => QuestionListResponseDto.from(q)),
  pageMetaTake20,
);

export const mockQuestionWithComment = {
  id: 'uuid',
  title: '질문제목',
  contents: '질문내용',
  questionStatus: EQuestionStatus.UnResolved,
  voteCount: 0,
  views: 0,
  commentCount: 0,
  fk_course_id: 'uuid',
  fk_user_id: 'uuid',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  course: {
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
    reviewCount: 1,
    wishCount: 0,
    totalVideosTime: 0,
    totalLessonCount: 0,
    students: 0,
    created_at: new Date('2023-10'),
    updated_at: new Date('2023-10'),
    fk_instructor_id: 'uuid',
  } as CourseEntity,
  user: {
    id: 'uuid',
    email: 'user1@a.com',
    nickname: '유저1',
    password: '$2a$10$8t.oP/R7OVs7w0ruteW5qOrGzRNhyH8.1inzO9B18irQupUNQFp3.',
    description: null,
    phone: '01011111111',
    profileAvatar:
      'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697735522023_cat.png',
    role: ERoleType.User,
    hashedRt: '$2a$10$73rXu6auNP5v8x/PhQMJZ.i75UZoqU/qwmn6jEGYsLJRw8Atwu54G',
    created_at: new Date('2023-10'),
    updated_at: new Date('2023-10'),
    deleted_at: null,
  } as UserEntity,
  questionComments: [
    {
      id: 'uuid',
      contents: '댓글입니다',
      fk_user_id: 'uuid',
      fk_question_id: 'uuid',
      fk_question_comment_parentId: null,
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      user: {
        id: 'uuid',
        email: 'user1@a.com',
        nickname: '유저',
        password:
          '$2a$10$8t.oP/R7OVs7w0ruteW5qOrGzRNhyH8.1inzO9B18irQupUNQFp3.',
        description: null,
        phone: '01011111111',
        profileAvatar: null,
        role: ERoleType.User,
        hashedRt:
          '$2a$10$73rXu6auNP5v8x/PhQMJZ.i75UZoqU/qwmn6jEGYsLJRw8Atwu54G',
        created_at: new Date('2023-10'),
        updated_at: new Date('2023-10'),
        deleted_at: null,
      } as UserEntity,
      reComments: [
        {
          id: 'uuid',
          contents: '댓글입니다',
          fk_user_id: 'uuid',
          fk_question_id: 'uuid',
          fk_question_comment_parentId: 'uuid',
          created_at: new Date('2023-10'),
          updated_at: new Date('2023-10'),
          user: {
            id: 'uuid',
            email: 'user1@a.com',
            nickname: '유저',
            password:
              '$2a$10$8t.oP/R7OVs7w0ruteW5qOrGzRNhyH8.1inzO9B18irQupUNQFp3.',
            description: null,
            phone: '01011111111',
            profileAvatar: null,
            role: 'User',
            hashedRt:
              '$2a$10$73rXu6auNP5v8x/PhQMJZ.i75UZoqU/qwmn6jEGYsLJRw8Atwu54G',
            created_at: new Date('2023-10'),
            updated_at: new Date('2023-10'),
            deleted_at: null,
          } as UserEntity,
        },
      ] as QuestionCommentEntity[],
    },
  ],
} as QuestionEntity;

export const expectedQuestionDetail = QuestionDetailResponseDto.from(
  mockQuestionWithComment,
);

export const mockQuestionRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

export const mockCourseService = {
  findOneByOptions: jest.fn(),
};

export const mockQuestionVoteService = {
  handleVoteUpdate: jest.fn(),
};

export const mockCourseUserService = {
  validateBoughtCourseByUser: jest.fn(),
};

export const mockEventEmitter2 = {
  emit: jest.fn(),
};

export const mockQuestionService = {
  findAll: jest.fn(),
  findAllByCourse: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateVoteStatus: jest.fn(),
  update: jest.fn(),
  status: jest.fn(),
  delete: jest.fn(),
};
