import { Test, TestingModule } from '@nestjs/testing';
import { SectionService } from '@src/section/section.service';
import { Repository } from 'typeorm';
import { SectionEntity } from '@src/section/entities/section.entity';
import { CourseService } from '@src/course/course.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockCourseService,
  mockCreatedSection,
  mockCreateSectionDto,
  mockSectionRepository,
  mockUpdateSectionDto,
} from '@test/__mocks__/section.mock';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('SectionService', () => {
  let sectionService: SectionService;
  let sectionRepositry: Repository<SectionEntity>;
  let courseService: CourseService;

  const sectionId = 'uuid';
  const userId = 'uuid';

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
    const mockPartialCourseEntity = {
      id: 'uuid',
      fk_instructor_id: 'uuid',
    } as CourseEntity;

    it('섹션 생성 성공', async () => {
      const { courseId, ...dto } = mockCreateSectionDto;

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockPartialCourseEntity);

      jest
        .spyOn(sectionRepositry, 'save')
        .mockResolvedValue(mockCreatedSection);

      const result = await sectionService.create(mockCreateSectionDto, userId);

      expect(result).toEqual(mockCreatedSection);
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
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.'),
        );

      try {
        await sectionService.create(mockCreateSectionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('해당 강의를 만든 지식공유자가 아닙니다.');
      }
    });
  });

  describe('[섹션 수정]', () => {
    const updateResult = { message: '수정 성공' };

    it('섹션 수정 성공', async () => {
      jest
        .spyOn(sectionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      jest
        .spyOn(sectionRepositry, 'save')
        .mockResolvedValue(mockCreatedSection);

      const result = await sectionService.update(
        sectionId,
        mockUpdateSectionDto,
        userId,
      );

      expect(result).toEqual(updateResult);
      expect(courseService.validateInstructor).toBeCalledTimes(1);
      expect(courseService.validateInstructor).toBeCalledWith(
        mockCreatedSection.fk_course_id,
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
        .mockResolvedValue(mockCreatedSection);

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
        .mockResolvedValue(mockCreatedSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      jest
        .spyOn(sectionRepositry, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await sectionService.delete(sectionId, userId);

      expect(result).toBe(true);
      expect(courseService.validateInstructor).toBeCalledWith(
        mockCreatedSection.fk_course_id,
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
        .mockResolvedValue(mockCreatedSection);

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
});
