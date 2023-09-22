import { ApiProperty } from '@nestjs/swagger';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { CourseWishEntity } from '@src/course_wish/entities/course-wish.entity';
import { IWishCourseListResponse } from '@src/course_wish/interfaces/course-wish.interface';
import { SimpleUserResponseDto } from '@src/user/dtos/response/user.response';
import { ISimpleUserResponse } from '@src/user/interfaces/user.interface';

export class CourseWishListResponseDto implements IWishCourseListResponse {
  @ApiProperty({ description: '강의 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '강의 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '강의 썸네일', type: 'string' })
  coverImage: string;

  @ApiProperty({ description: '강의 - 평균 리뷰 점수', type: 'number' })
  averageRating: number;

  @ApiProperty({ description: '강의 가격', type: 'number' })
  price: number;

  @ApiProperty({ description: '강의 - 학생 수', type: 'number' })
  students: number;

  @ApiProperty({
    description: '강의 수준',
    enum: ECourseLevelType,
    enumName: 'ECourseLevelType',
  })
  level: ECourseLevelType;

  @ApiProperty({
    description: '강의의 지식공유자 정보',
    type: SimpleUserResponseDto,
  })
  instructor: ISimpleUserResponse;

  static from(courseWish: CourseWishEntity): CourseWishListResponseDto {
    const dto = new CourseWishListResponseDto();
    const { course } = courseWish;

    dto.id = course.id;
    dto.title = course.title;
    dto.coverImage = course.coverImage;
    dto.averageRating = course.averageRating;
    dto.price = course.price;
    dto.students = course.students;
    dto.level = course.level;
    dto.instructor = SimpleUserResponseDto.from(course.instructor);

    return dto;
  }
}
