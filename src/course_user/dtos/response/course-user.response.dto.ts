import { ApiProperty } from '@nestjs/swagger';
import { CourseUserEntity } from 'src/course_user/entities/course-user.entity';
import { ICourseUserList } from 'src/course_user/interfaces/course-user.interface';

export class CourseUserListResponseDto implements ICourseUserList {
  @ApiProperty({ description: '강의 ID', type: 'string' })
  course_id: string;

  @ApiProperty({ description: '강의 썸네일', type: 'string' })
  course_coverImage: string;

  @ApiProperty({ description: '강의 제목', type: 'string' })
  course_title: string;

  static from(courseUser: CourseUserEntity): CourseUserListResponseDto {
    const dto = new CourseUserListResponseDto();
    const { course } = courseUser;

    dto.course_id = course.id;
    dto.course_coverImage = course.coverImage;
    dto.course_title = course.title;

    return dto;
  }
}
