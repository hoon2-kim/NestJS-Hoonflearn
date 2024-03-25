import { Test, TestingModule } from '@nestjs/testing';
import { SectionService } from '@src/section/section.service';
import { EntityManager, Repository } from 'typeorm';
import { SectionEntity } from '@src/section/entities/section.entity';
import { CourseService } from '@src/course/course.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ELessonAction } from '@src/lesson/enums/lesson.enum';
import { mockSectionRepository } from '@test/__mocks__/mock-repository';
import { mockCourseService } from '@test/__mocks__/mock-service';
import {
  mockCreateSectionDto,
  mockSection,
  mockUpdateSectionDto,
} from '@test/__mocks__/mock-data';

describe('SectionService', () => {
  let sectionService: SectionService;
  let sectionRepositry: Repository<SectionEntity>;
  let courseService: CourseService;

  const sectionId = 'uuid';
  const userId = 'uuid';
  const mockEntityManager = {
    increment: jest.fn(),
    decrement: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionService,
        {
          provide: getRepositoryToken(SectionEntity),
          useValue: mockSectionRepository,
        },
        {
          provide: CourseService,
          useValue: mockCourseService,
        },
      ],
    }).compile();

    sectionService = module.get<SectionService>(SectionService);
    sectionRepositry = module.get<Repository<SectionEntity>>(
      getRepositoryToken(SectionEntity),
    );
    courseService = module.get<CourseService>(CourseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sectionService).toBeDefined();
    expect(sectionRepositry).toBeDefined();
    expect(courseService).toBeDefined();
  });

  describe('[섹션 생성]', () => {
    it('섹션 생성 성공', async () => {
      const { courseId, ...dto } = mockCreateSectionDto;
      const mockPartialCourseEntity = {
        id: 'uuid',
        fk_instructor_id: 'uuid',
      } as CourseEntity;

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockPartialCourseEntity);

      jest.spyOn(sectionRepositry, 'save').mockResolvedValue(mockSection);

      const result = await sectionService.create(mockCreateSectionDto, userId);

      expect(result).toEqual(mockSection);
      expect(mockSectionRepository.save).toBeCalled();
      expect(mockSectionRepository.save).toBeCalledWith({
        ...dto,
        fk_course_id: courseId,
      });
    });

    it('섹션 생성 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await sectionService.create(mockCreateSectionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('섹션 생성 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      const mockPartialCourseEntity = {
        id: 'uuid',
        fk_instructor_id: 'uuid',
      } as CourseEntity;

      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue({
        ...mockPartialCourseEntity,
        fk_instructor_id: 'anotherInstructorId',
      });

      try {
        await sectionService.create(mockCreateSectionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('해당 강의를 만든 지식공유자가 아닙니다.');
      }
    });
  });

  describe('[섹션 수정]', () => {
    it('섹션 수정 성공', async () => {
      const mockUpdateSection = Object.assign(
        mockSection,
        mockUpdateSectionDto,
      );

      jest
        .spyOn(sectionService, 'findOneByOptions')
        .mockResolvedValue(mockSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      jest.spyOn(sectionRepositry, 'save').mockResolvedValue(mockUpdateSection);

      const result = await sectionService.update(
        sectionId,
        mockUpdateSectionDto,
        userId,
      );

      expect(result).toBeUndefined();
      expect(courseService.validateInstructor).toBeCalledTimes(1);
      expect(courseService.validateInstructor).toBeCalledWith(
        mockSection.fk_course_id,
        userId,
      );
    });

    it('섹션 수정 실패 - 해당 섹션이 없는 경우(404에러)', async () => {
      jest.spyOn(sectionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await sectionService.update(sectionId, mockUpdateSectionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('섹션 수정 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(sectionService, 'findOneByOptions')
        .mockResolvedValue(mockSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.'),
        );

      try {
        await sectionService.update(sectionId, mockUpdateSectionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('해당 강의를 만든 지식공유자가 아닙니다.');
      }
    });
  });

  describe('[섹션 삭제]', () => {
    it('섹션 삭제 성공', async () => {
      jest
        .spyOn(sectionService, 'findOneByOptions')
        .mockResolvedValue(mockSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      jest
        .spyOn(sectionRepositry, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await sectionService.delete(sectionId, userId);

      expect(result).toBeUndefined();
      expect(courseService.validateInstructor).toBeCalledWith(
        mockSection.fk_course_id,
        userId,
      );
    });

    it('섹션 삭제 실패 - 해당 섹션이 없는 경우(404에러)', async () => {
      jest.spyOn(sectionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await sectionService.delete(sectionId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('섹션 삭제 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(sectionService, 'findOneByOptions')
        .mockResolvedValue(mockSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.'),
        );

      try {
        await sectionService.delete(sectionId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('해당 강의를 만든 지식공유자가 아닙니다.');
      }
    });
  });

  describe('updateLessonCountInSection 테스트 - 수업 행동에 따라 섹션엔티티 수업 수 업데이트 로직', () => {
    it('수업 생성인 경우 수업 수 증가', async () => {
      const action = ELessonAction.Create;
      jest
        .spyOn(mockEntityManager, 'increment')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      const result = await sectionService.updateLessonCountInSection(
        sectionId,
        action,
        mockEntityManager,
      );

      expect(result).toBeUndefined();
      expect(mockEntityManager.increment).toBeCalledWith(
        SectionEntity,
        { id: sectionId },
        'totalLessonBySectionCount',
        1,
      );
    });

    it('수업 삭제인 경우 수업 수 감소', async () => {
      const action = ELessonAction.Delete;
      jest
        .spyOn(mockEntityManager, 'decrement')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      const result = await sectionService.updateLessonCountInSection(
        sectionId,
        action,
        mockEntityManager,
      );

      expect(result).toBeUndefined();
      expect(mockEntityManager.decrement).toBeCalledWith(
        SectionEntity,
        { id: sectionId },
        'totalLessonBySectionCount',
        1,
      );
    });
  });
});
