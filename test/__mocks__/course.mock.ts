import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { UserEntity } from '@src/user/entities/user.entity';
import { ERoleType } from '@src/user/enums/user.enum';

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
