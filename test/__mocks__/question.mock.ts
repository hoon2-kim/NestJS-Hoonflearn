import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { InstructorQuestionQueryDto } from '@src/instructor/dtos/query/instructor.query.dto';
import { QuestionListResponseDto } from '@src/question/dtos/response/question.response.dto';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { EQuestionStatus } from '@src/question/enums/question.enum';
import { UserEntity } from '@src/user/entities/user.entity';
import { ERoleType } from '@src/user/enums/user.enum';

export const mockQuestions = [
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
      password: '$2a$10$8t.oP/R7OVs7w0ruteW5qOrGzRNhyH8.1inzO9B18irQupUNQFp3.',
      description: null,
      phone: '01011111111',
      profileAvatar:
        'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697735522023_cat.png',
      role: ERoleType.User,
      hashedRt: '$2a$10$VVPxFdJkwrC.pWGEc5baxuMY0tzrx8rX7mS1ztqN0lc4ujTWeIYju',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      deleted_at: null,
    } as UserEntity,
  },
] as QuestionEntity[];

const pageMeta = new PageMetaDto({
  pageOptionDto: new InstructorQuestionQueryDto(),
  itemCount: 10,
});
export const expectedQuestionByInstructor = new PageDto(
  mockQuestions.map((q) => QuestionListResponseDto.from(q)),
  pageMeta,
);
