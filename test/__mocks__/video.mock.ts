import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { VideoEntity } from '@src/video/entities/video.entity';

export const mockCreatedVideo = {
  id: 'uuid',
  videoUrl:
    'https://hoonflearn-s3.s3.amazonaws.com/유저-4bf75ad8-563b-45a9-a027-aec7837a7053/강의-41b5dde8-07fa-4646-8b33-7dd4b0b15e0e/videos/1698343897262_고양이끼리소통API(댓글,좋아요).mp4',
  videoTime: 10000,
  fk_lesson_id: 'uuid',
  created_at: new Date('2023-10'),
} as VideoEntity;

export const mockVideoWithLesson: VideoEntity = {
  ...mockCreatedVideo,
  lesson: {
    id: 'uuid',
    title: '수업',
    note: null,
    isFreePublic: false,
    fk_section_id: 'uuid',
    created_at: new Date('2023-10'),
    updated_at: new Date('2023-10'),
  } as LessonEntity,
};

export const mockCourseService = {
  validateInstructor: jest.fn(),
};

export const mockLessonService = {
  findOneByOptions: jest.fn(),
  getCourseIdByLessonIdWithQueryBuilder: jest.fn(),
};

export const mockAwsS3Service = {
  deleteS3Object: jest.fn(),
  uploadFileToS3: jest.fn(),
};

export const mockVideoService = {
  upload: jest.fn(),
  delete: jest.fn(),
};
