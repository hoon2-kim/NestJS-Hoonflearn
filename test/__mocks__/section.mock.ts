import { CreateSectionDto } from '@src/section/dtos/request/create-section.dto';
import { UpdateSectionDto } from '@src/section/dtos/request/update-section.dto';
import { SectionEntity } from '@src/section/entities/section.entity';

export const mockCreateSectionDto: CreateSectionDto = {
  courseId: 'uuid',
  title: '섹션',
  goal: '목표',
};

export const mockUpdateSectionDto: UpdateSectionDto = {
  title: '수정',
  goal: '수정',
};

export const mockCreatedSection = {
  id: 'uuid',
  title: '섹션',
  goal: '섹션목표',
  totalSectionTime: 0,
  totalLessonBySectionCount: 0,
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_course_id: 'uuid',
} as SectionEntity;

export const mockSectionRepository = {
  save: jest.fn(),
  delete: jest.fn(),
};

export const mockCourseService = {
  findOneByOptions: jest.fn(),
  validateInstructor: jest.fn(),
};

export const mockSectionService = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
