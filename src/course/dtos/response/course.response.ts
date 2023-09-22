import { ApiProperty } from '@nestjs/swagger';
import { CategoryCourseMainNameResponseDto } from '@src/category_course/dtos/response/category-course.response.dto';
import { ICategoryCourseMainNameResponse } from '@src/category_course/interfaces/category-course.interface';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import {
  ICartCourseResponse,
  ICourseDashboardResponse,
  ICourseDetailCourseInfoResponse,
  ICourseDetailResponse,
  ICourseIdsResponse,
  ICourseListByInstructorResponse,
  ICourseListResponse,
  IOrderDetailCourseResponse,
  ISimpleCourseResponse,
} from '@src/course/interfaces/course.interface';
import { CourseDashBoardQuestionResponseDto } from '@src/question/dtos/response/question.response.dto';
import { ICourseDashboardQuestionResponse } from '@src/question/interfaces/question.interface';
import { SectionResponseDto } from '@src/section/dtos/response/section.response.dto';
import { ISectionResponse } from '@src/section/interfaces/section.interface';
import { SimpleUserResponseDto } from '@src/user/dtos/response/user.response';
import { ISimpleUserResponse } from '@src/user/interfaces/user.interface';

export class SimpleCourseResponseDto implements ISimpleCourseResponse {
  @ApiProperty({ description: '강의 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '강의 제목', type: 'string' })
  title: string;

  static from(course: CourseEntity): SimpleCourseResponseDto {
    const dto = new SimpleCourseResponseDto();

    dto.id = course.id;
    dto.title = course.title;

    return dto;
  }
}

export class CourseIdsReponseDto implements ICourseIdsResponse {
  @ApiProperty({ description: '강의 ID들', type: 'string', isArray: true })
  courseIds: string[];

  static from(courses: CourseEntity[]): CourseIdsReponseDto {
    const dto = new CourseIdsReponseDto();

    dto.courseIds = courses.map((c) => c.id);

    return dto;
  }

  get getCourseIdsFlat(): string[] {
    return this.courseIds;
  }
}

export class OrderDetailCourseResponseDto
  implements IOrderDetailCourseResponse
{
  @ApiProperty({ description: '강의 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '강의 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '강의 썸네일', type: 'string' })
  coverImage: string;

  static from(course: CourseEntity): OrderDetailCourseResponseDto {
    const dto = new OrderDetailCourseResponseDto();
    const { id, title, coverImage } = course;

    dto.id = id;
    dto.title = title;
    dto.coverImage = coverImage;

    return dto;
  }
}

export class CourseListResponseDto implements ICourseListResponse {
  @ApiProperty({ description: '강의 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '강의 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '강의 썸네일', type: 'string' })
  coverImage: string;

  @ApiProperty({ description: '강의 가격', type: 'number' })
  price: number;

  @ApiProperty({
    description: '강의 수준',
    enum: ECourseLevelType,
    enumName: 'ECourseLevelType',
  })
  level: ECourseLevelType;

  @ApiProperty({ description: '강의 학생수', type: 'number' })
  students: number;

  @ApiProperty({ description: '강의 평균 리뷰 점수', type: 'number' })
  averageRating: number;

  @ApiProperty({
    description: '강의의 지식공유자 정보',
    type: SimpleUserResponseDto,
  })
  instructor: ISimpleUserResponse;

  static from(course: CourseEntity): CourseListResponseDto {
    const dto = new CourseListResponseDto();
    const {
      id,
      title,
      coverImage,
      price,
      level,
      students,
      averageRating,
      instructor,
    } = course;

    dto.id = id;
    dto.title = title;
    dto.coverImage = coverImage;
    dto.price = price;
    dto.level = level;
    dto.students = students;
    dto.averageRating = averageRating;
    dto.instructor = SimpleUserResponseDto.from(instructor);

    return dto;
  }
}

export class CourseDetailCourseInfoResponseDto
  implements ICourseDetailCourseInfoResponse
{
  @ApiProperty({ description: '강의 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '강의 제목', type: 'string' })
  title: string;

  @ApiProperty({
    description: '강의 - 이런걸 배울 수 있어요',
    type: 'string',
    isArray: true,
  })
  learnable: string[];

  @ApiProperty({
    description: '강의 - 이런 분들에게 추천해요',
    type: 'string',
    isArray: true,
  })
  recommendedFor: string[];

  @ApiProperty({
    description: '강의 - 선수 지식',
    type: 'string',
    isArray: true,
  })
  prerequisite: string[];

  @ApiProperty({
    description: '강의 수준',
    enum: ECourseLevelType,
    enumName: 'ECourseLevelType',
  })
  level: ECourseLevelType;

  @ApiProperty({ description: '강의 두줄 요약', type: 'string' })
  summary: string;

  @ApiProperty({ description: '강의 상세 소개', type: 'string' })
  description: string;

  @ApiProperty({ description: '강의 가격', type: 'number' })
  price: number;

  @ApiProperty({ description: '강의 썸네일', type: 'string' })
  coverImage: string;

  @ApiProperty({ description: '강의 - 평균 리뷰 점수', type: 'number' })
  averageRating: number;

  @ApiProperty({ description: '강의 - 리뷰 수', type: 'number' })
  reviewCount: number;

  @ApiProperty({ description: '강의 - 찜한 수', type: 'number' })
  wishCount: number;

  @ApiProperty({ description: '강의 - 학생 수', type: 'number' })
  students: number;

  @ApiProperty({ description: '강의의 총 수업 수', type: 'number' })
  totalLessonCount: number;

  @ApiProperty({ description: '강의의 총 영상 길이', type: 'number' })
  totalVideosTime: number;

  @ApiProperty({
    description: '강의 - 생성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: '강의의 지식공유자 정보',
    type: SimpleUserResponseDto,
  })
  instructor: ISimpleUserResponse;

  @ApiProperty({
    description: '강의의 카테고리',
    type: CategoryCourseMainNameResponseDto,
    isArray: true,
  })
  category_course: ICategoryCourseMainNameResponse[];

  static from(course: CourseEntity): CourseDetailCourseInfoResponseDto {
    const dto = new CourseDetailCourseInfoResponseDto();
    const {
      id,
      title,
      learnable,
      recommendedFor,
      prerequisite,
      level,
      summary,
      description,
      price,
      coverImage,
      averageRating,
      reviewCount,
      wishCount,
      students,
      created_at,
      instructor,
      categoriesCourses,
      totalLessonCount,
      totalVideosTime,
    } = course;

    dto.id = id;
    dto.title = title;
    dto.learnable = learnable;
    dto.recommendedFor = recommendedFor;
    dto.prerequisite = prerequisite;
    dto.level = level;
    dto.summary = summary;
    dto.description = description;
    dto.price = price;
    dto.coverImage = coverImage;
    dto.averageRating = averageRating;
    dto.reviewCount = reviewCount;
    dto.wishCount = wishCount;
    dto.students = students;
    dto.totalLessonCount = totalLessonCount;
    dto.totalVideosTime = totalVideosTime;
    dto.created_at = created_at;
    dto.instructor = SimpleUserResponseDto.from(instructor);
    dto.category_course = categoriesCourses.map((c) =>
      CategoryCourseMainNameResponseDto.from(c),
    );

    return dto;
  }
}

export class CourseDetailResponseDto implements ICourseDetailResponse {
  @ApiProperty({
    description: '강의 정보',
    type: CourseDetailCourseInfoResponseDto,
  })
  course_info: ICourseDetailCourseInfoResponse;

  @ApiProperty({
    description: '강의의 커리큘럼',
    type: SectionResponseDto,
    isArray: true,
  })
  curriculums: ISectionResponse[];

  static from(course: CourseEntity) {
    const dto = new CourseDetailResponseDto();
    const { sections } = course;

    dto.course_info = CourseDetailCourseInfoResponseDto.from(course);
    dto.curriculums = sections?.map((s) => SectionResponseDto.from(s));

    return dto;
  }
}

export class CourseListByInstructorResponseDto
  implements ICourseListByInstructorResponse
{
  @ApiProperty({ description: '강의 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '강의 썸네일', type: 'string' })
  coverImage: string;

  @ApiProperty({ description: '강의 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '강의 - 평균 리뷰 점수', type: 'number' })
  averageRating: number;

  @ApiProperty({ description: '강의 - 질문 수', type: 'number' })
  questionCount: number;

  @ApiProperty({ description: '강의 - 학생 수', type: 'number' })
  students: number;

  static from(
    course: CourseEntity,
    questionCount: number,
  ): CourseListByInstructorResponseDto {
    const dto = new CourseListByInstructorResponseDto();
    const { id, coverImage, title, averageRating, students } = course;

    dto.id = id;
    dto.coverImage = coverImage;
    dto.title = title;
    dto.averageRating = averageRating;
    dto.students = students;
    dto.questionCount = questionCount;

    return dto;
  }
}

export class CartCourseResponseDto implements ICartCourseResponse {
  @ApiProperty({ description: '강의 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '강의 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '강의 썸네일', type: 'string' })
  coverImage: string;

  @ApiProperty({ description: '강의 가격', type: 'number' })
  price: number;

  @ApiProperty({
    description: '강의의 지식공유자 정보',
    type: SimpleUserResponseDto,
  })
  instructor: ISimpleUserResponse;

  static from(course: CourseEntity): CartCourseResponseDto {
    const dto = new CartCourseResponseDto();
    const { id, title, coverImage, price, instructor } = course;

    dto.id = id;
    dto.title = title;
    dto.coverImage = coverImage;
    dto.price = price;
    dto.instructor = SimpleUserResponseDto.from(instructor);

    return dto;
  }
}

export class CourseDashBoardResponseDto implements ICourseDashboardResponse {
  @ApiProperty({
    description: '강의의 최근 질문들',
    type: CourseDashBoardQuestionResponseDto,
    isArray: true,
  })
  recent_question: ICourseDashboardQuestionResponse[];

  @ApiProperty({
    description: '강의의 커리큘럼',
    type: SectionResponseDto,
    isArray: true,
  })
  curriculums: ISectionResponse[];

  static from(course: CourseEntity): CourseDashBoardResponseDto {
    const dto = new CourseDashBoardResponseDto();
    const { sections, questions } = course;

    dto.recent_question = questions?.map((q) =>
      CourseDashBoardQuestionResponseDto.from(q),
    );
    dto.curriculums = sections?.map((s) => SectionResponseDto.from(s));

    return dto;
  }
}
