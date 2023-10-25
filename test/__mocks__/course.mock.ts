import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { mockCreatedInstructor } from './user.mock';

export const mockCreatedCourse = (): CourseEntity => {
  const courseEntity = new CourseEntity();
  courseEntity.id = 'uuid';
  courseEntity.title = '강의제목';
  courseEntity.summary = '강의요약';
  courseEntity.description = '상세설명';
  courseEntity.coverImage = null;
  courseEntity.price = 10000;
  courseEntity.learnable = ['자바스크립트', '타입스크립트'];
  courseEntity.recommendedFor = ['개발입문자'];
  courseEntity.prerequisite = ['html', 'css'];
  courseEntity.level = ECourseLevelType.Beginner;
  courseEntity.averageRating = 0;
  courseEntity.reviewCount = 0;
  courseEntity.wishCount = 0;
  courseEntity.totalVideosTime = 0;
  courseEntity.totalLessonCount = 0;
  courseEntity.students = 0;
  courseEntity.created_at = new Date('2023-10');
  courseEntity.updated_at = new Date('2023-10');
  courseEntity.instructor = mockCreatedInstructor();

  return courseEntity;
};
