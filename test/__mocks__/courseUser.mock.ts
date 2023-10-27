import { CourseUserEntity } from '@src/course_user/entities/course-user.entity';
import { ECouresUserType } from '@src/course_user/enums/course-user.enum';

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
