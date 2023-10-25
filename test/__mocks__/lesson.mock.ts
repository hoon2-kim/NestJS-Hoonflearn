import { CreateLessonDto } from '@src/lesson/dtos/request/create-lesson.dto';
import { UpdateLessonDto } from '@src/lesson/dtos/request/update-lesson.dto';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { VideoEntity } from '@src/video/entities/video.entity';

export const mockCreateLessonDto: CreateLessonDto = {
  sectionId: 'uuid',
  title: '수업',
  isFreePublic: true,
  note: '수업노트',
};

export const mockUpdateLessonDto: UpdateLessonDto = {
  title: '수정',
  note: '수정',
  isFreePublic: false,
};

export const mockCreatedLesson = {
  id: 'uuid',
  title: '수업',
  note: '수업노트',
  isFreePublic: true,
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_section_id: 'uuid',
} as LessonEntity;

export const mockLessonWithVideo = {
  id: 'uuid',
  title: '수업',
  note: '수업노트',
  isFreePublic: true,
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_section_id: 'uuid',
  video: {
    id: 'uuid',
    videoUrl:
      'https://hoonflearn-s3.s3.amazonaws.com/유저-4bf75ad8-563b-45a9-a027-aec7837a7053/강의-41b5dde8-07fa-4646-8b33-7dd4b0b15e0e/videos/1698134140103_고양이끼리소통API(댓글,좋아요).mp4',
    videoTime: 3600,
    fk_lesson_id: 'uuid',
    created_at: new Date('2023-10'),
  } as VideoEntity,
} as LessonEntity;

export const mockLessonRepository = {
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    setQueryRunner: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  })),
};

export const mockSectionService = {
  findOneByOptions: jest.fn(),
  updateLessonCountInSection: jest.fn(),
};

export const mockCourseService = {
  validateInstructor: jest.fn(),
  updateTotalLessonCountInCourse: jest.fn(),
};

export const mockCourseUserService = {
  validateBoughtCourseByUser: jest.fn(),
};

export const mockAwsS3Service = {
  deleteS3Object: jest.fn(),
};

export const mockLessonService = {
  viewLesson: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
