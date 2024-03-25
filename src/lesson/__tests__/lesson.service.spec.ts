import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from '@src/lesson/lesson.service';
import { DataSource, Repository } from 'typeorm';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { SectionService } from '@src/section/section.service';
import { CourseService } from '@src/course/course.service';
import { CourseUserService } from '@src/course_user/course-user.service';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  mockCreateLessonDto,
  mockInstructor,
  mockLesson,
  mockSection,
  mockUpdateLessonDto,
  mockUserByEmail,
  mockVideo,
} from '@test/__mocks__/mock-data';
import { mockLessonRepository } from '@test/__mocks__/mock-repository';
import {
  mockSectionService,
  mockCourseService,
  mockCourseUserService,
  mockAwsS3Service,
} from '@test/__mocks__/mock-service';

describe('LessonService', () => {
  let lessonService: LessonService;
  let lessonRepository: Repository<LessonEntity>;
  let sectionService: SectionService;
  let courseService: CourseService;
  let courseUserService: CourseUserService;
  let awsS3Service: AwsS3Service;
  let dataSource: DataSource;

  const courseId = 'uuid';
  const lessonId = 'uuid';
  const userId = 'uuid';

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        {
          provide: getRepositoryToken(LessonEntity),
          useValue: mockLessonRepository,
        },
        {
          provide: SectionService,
          useValue: mockSectionService,
        },
        {
          provide: CourseService,
          useValue: mockCourseService,
        },
        {
          provide: CourseUserService,
          useValue: mockCourseUserService,
        },
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    lessonService = module.get<LessonService>(LessonService);
    lessonRepository = module.get<Repository<LessonEntity>>(
      getRepositoryToken(LessonEntity),
    );
    sectionService = module.get<SectionService>(SectionService);
    courseService = module.get<CourseService>(CourseService);
    courseUserService = module.get<CourseUserService>(CourseUserService);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(lessonService).toBeDefined();
    expect(lessonRepository).toBeDefined();
    expect(sectionService).toBeDefined();
    expect(courseService).toBeDefined();
    expect(courseUserService).toBeDefined();
    expect(awsS3Service).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('[수업 생성]', () => {
    it('수업 생성 성공', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockLesson);

      jest
        .spyOn(sectionService, 'findOneByOptions')
        .mockResolvedValue(mockSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        jest
          .spyOn(sectionService, 'updateLessonCountInSection')
          .mockResolvedValue(undefined);
        jest
          .spyOn(courseService, 'updateTotalLessonCountInCourse')
          .mockResolvedValue(undefined);

        return await cb({ save: mockSave });
      });

      const result = await lessonService.create(mockCreateLessonDto, userId);

      expect(result).toEqual(mockLesson);
      expect(sectionService.updateLessonCountInSection).toBeCalledTimes(1);
      expect(courseService.updateTotalLessonCountInCourse).toBeCalledTimes(1);
      expect(mockSave).toHaveBeenCalled();
      expect(result.fk_section_id).toEqual(mockCreateLessonDto.sectionId);
    });

    it('수업 생성 실패 - 섹션이 존재하지 않는 경우(404에러)', async () => {
      jest.spyOn(sectionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await lessonService.create(mockCreateLessonDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('수업 생성 실패 - 트랜잭션 내 서비스로직 오류(잘못된 enum값 - 400에러)', async () => {
      jest
        .spyOn(sectionService, 'findOneByOptions')
        .mockResolvedValue(mockSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      dataSource.transaction = jest.fn().mockImplementation(() => {
        jest
          .spyOn(sectionService, 'updateLessonCountInSection')
          .mockRejectedValue(
            new BadRequestException('잘못된 enum값이 들어왔습니다.'),
          );
      });

      try {
        await lessonService.create(mockCreateLessonDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('잘못된 enum값이 들어왔습니다.');
      }
    });

    it('수업 생성 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(sectionService, 'findOneByOptions')
        .mockResolvedValue(mockSection);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.'),
        );

      try {
        await lessonService.create(mockCreateLessonDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('해당 강의를 만든 지식공유자가 아닙니다.');
      }
    });
  });

  describe('[수업 수정]', () => {
    it('수업 수정 성공', async () => {
      const mockUpdateLesson = Object.assign(mockLesson, mockUpdateLessonDto);

      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);
      jest.spyOn(lessonRepository, 'save').mockResolvedValue(mockUpdateLesson);

      const result = await lessonService.update(
        lessonId,
        mockUpdateLessonDto,
        userId,
      );

      expect(result).toBeUndefined();
      expect(
        lessonService.getCourseIdByLessonIdWithQueryBuilder,
      ).toBeCalledTimes(1);
      expect(courseService.validateInstructor).toBeCalledTimes(1);
    });

    it('수업 수정 실패 - 해당 수업이 존재하지 않는 경우(404에러)', async () => {
      jest.spyOn(lessonService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await lessonService.update(lessonId, mockUpdateLessonDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('수업 수정 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLesson);

      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.'),
        );

      try {
        await lessonService.update(lessonId, mockUpdateLessonDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[수업 삭제]', () => {
    const mockDelete = jest.fn().mockResolvedValue({ affected: 1 });
    const mockDecrement = jest
      .fn()
      .mockResolvedValueOnce({ generatedMaps: [], raw: [], affected: 1 })
      .mockResolvedValueOnce({ generatedMaps: [], raw: [], affected: 1 });

    it('수업 삭제 성공 - 영상이 없는 경우', async () => {
      const mockLessonWithOutVideo = mockLesson;

      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLessonWithOutVideo);

      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        jest
          .spyOn(sectionService, 'updateLessonCountInSection')
          .mockResolvedValue(undefined);

        jest
          .spyOn(courseService, 'updateTotalLessonCountInCourse')
          .mockResolvedValue(undefined);

        return await cb({ delete: mockDelete });
      });

      const result = await lessonService.delete(lessonId, userId);

      expect(result).toBeUndefined();
      expect(
        lessonService.getCourseIdByLessonIdWithQueryBuilder,
      ).toBeCalledTimes(1);
      expect(courseService.validateInstructor).toBeCalledTimes(1);
      expect(courseService.validateInstructor).toBeCalledWith(courseId, userId);
      expect(sectionService.updateLessonCountInSection).toBeCalledTimes(1);
      expect(courseService.updateTotalLessonCountInCourse).toBeCalledTimes(1);
    });

    it('수업 삭제 성공 - 영상이 있는 경우', async () => {
      const mockLessonWithVideo = { ...mockLesson, video: mockVideo };

      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLessonWithVideo);

      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        jest
          .spyOn(sectionService, 'updateLessonCountInSection')
          .mockResolvedValue(undefined);

        jest
          .spyOn(courseService, 'updateTotalLessonCountInCourse')
          .mockResolvedValue(undefined);

        jest
          .spyOn(awsS3Service, 'deleteS3Object')
          .mockResolvedValue({ success: true });

        return await cb({ decrement: mockDecrement, delete: mockDelete });
      });

      const result = await lessonService.delete(lessonId, userId);

      expect(result).toBeUndefined();
      expect(
        lessonService.getCourseIdByLessonIdWithQueryBuilder,
      ).toBeCalledTimes(1);
      expect(courseService.validateInstructor).toBeCalledTimes(1);
      expect(courseService.validateInstructor).toBeCalledWith(courseId, userId);
      expect(sectionService.updateLessonCountInSection).toBeCalledTimes(1);
      expect(courseService.updateTotalLessonCountInCourse).toBeCalledTimes(1);
      expect(mockDecrement).toBeCalledTimes(2);
      expect(awsS3Service.deleteS3Object).toBeCalledTimes(1);
    });

    it('수업 삭제 실패 - 해당 수업이 없는 경우(404에러)', async () => {
      jest.spyOn(lessonService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await lessonService.delete(lessonId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('수업 삭제 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLesson);

      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.'),
        );

      try {
        await lessonService.delete(lessonId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('해당 강의를 만든 지식공유자가 아닙니다.');
      }
    });

    it('수업 삭제 실패 - 영상 삭제 실패하는 경우(aws-s3)(400에러)', async () => {
      const mockLessonWithVideo = { ...mockLesson, video: mockVideo };

      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLessonWithVideo);

      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        jest
          .spyOn(sectionService, 'updateLessonCountInSection')
          .mockResolvedValue(undefined);
        jest
          .spyOn(courseService, 'updateTotalLessonCountInCourse')
          .mockResolvedValue(undefined);
        jest
          .spyOn(awsS3Service, 'deleteS3Object')
          .mockRejectedValue(new BadRequestException());

        return await cb({ decrement: mockDecrement, delete: mockDelete });
      });

      try {
        await lessonService.delete(lessonId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[수업 조회]', () => {
    const mockViewLesson = { ...mockLesson, video: mockVideo };

    it('수업 조회 성공 - 유저인 경우 강의 구매 검증까지', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockViewLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockResolvedValue(undefined);

      const result = await lessonService.viewLesson(lessonId, mockUserByEmail);

      expect(result).toEqual(mockViewLesson);
      expect(courseUserService.validateBoughtCourseByUser).toBeCalledTimes(1);
      expect(courseUserService.validateBoughtCourseByUser).toBeCalledWith(
        mockUserByEmail.id,
        courseId,
      );
      expect(courseService.validateInstructor).toBeCalledTimes(0);
    });

    it('수업 조회 성공 - 강의를 만든 지식공유자인 경우 통과', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockViewLesson);

      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);

      const result = await lessonService.viewLesson(lessonId, mockInstructor);

      expect(result).toEqual(mockViewLesson);
      expect(courseUserService.validateBoughtCourseByUser).toBeCalledTimes(0);
      expect(courseService.validateInstructor).toBeCalledTimes(1);
      expect(courseService.validateInstructor).toBeCalledWith(
        courseId,
        mockInstructor.id,
      );
    });

    it('수업 조회 실패 - 해당 수업이 없는 경우(404에러)', async () => {
      jest.spyOn(lessonService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await lessonService.viewLesson(lessonId, mockUserByEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('수업 조회 실패 - 강의를 구매하지 않은 유저인 경우(404에러)', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockViewLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 구매하지 않으셨습니다.'),
        );

      try {
        await lessonService.viewLesson(lessonId, mockUserByEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

    it('수업 조회 실패 - 강의구매X + 강의만든 지식공유자가 아닌 경우(404에러)', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockViewLesson);

      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);

      jest
        .spyOn(courseService, 'validateInstructor')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 구매하지 않으셨습니다.'),
        );

      try {
        await lessonService.viewLesson(lessonId, mockInstructor);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('getCourseIdByLessonIdWithQueryBuilder 테스트 - 수업ID로 강의ID 가져오기', () => {
    it('성공', async () => {
      const mockLessonWithSection = {
        ...mockLesson,
        section: mockSection,
      };

      jest
        .spyOn(lessonRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(mockLessonWithSection);

      const result = await lessonService.getCourseIdByLessonIdWithQueryBuilder(
        lessonId,
      );

      expect(result).toEqual(mockLessonWithSection.section.fk_course_id);
      expect(
        lessonRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(1);
      expect(lessonRepository.createQueryBuilder().select).toBeCalledTimes(1);
      expect(lessonRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(lessonRepository.createQueryBuilder().getOne).toBeCalledTimes(1);
    });
  });
});
