import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from '@src/lesson/lesson.controller';
import { LessonService } from '@src/lesson/lesson.service';
import {
  mockLesson,
  mockVideo,
  mockCreateLessonDto,
  mockUpdateLessonDto,
  mockUserByEmail,
} from '@test/__mocks__/mock-data';
import { mockLessonService } from '@test/__mocks__/mock-service';

describe('LessonController', () => {
  let lessonController: LessonController;
  let lessonService: LessonService;

  const lessonId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [
        {
          provide: LessonService,
          useValue: mockLessonService,
        },
      ],
    }).compile();

    lessonController = module.get<LessonController>(LessonController);
    lessonService = module.get<LessonService>(LessonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(lessonController).toBeDefined();
    expect(lessonService).toBeDefined();
  });

  describe('[LessonController.viewLesson] - 수업 조회', () => {
    it('수업 조회 성공', async () => {
      const mockViewLesson = { ...mockLesson, video: mockVideo };

      jest.spyOn(lessonService, 'viewLesson').mockResolvedValue(mockViewLesson);

      const result = await lessonController.viewLesson(
        lessonId,
        mockUserByEmail,
      );

      expect(result).toEqual(mockViewLesson);
      expect(lessonService.viewLesson).toHaveBeenCalled();
      expect(lessonService.viewLesson).toBeCalledWith(
        lessonId,
        mockUserByEmail,
      );
    });
  });

  describe('[LessonController.createLesson] - 수업 생성', () => {
    it('수업 생성 성공', async () => {
      jest.spyOn(lessonService, 'create').mockResolvedValue(mockLesson);

      const result = await lessonController.createLesson(
        mockCreateLessonDto,
        userId,
      );

      expect(result).toEqual(mockLesson);
      expect(lessonService.create).toHaveBeenCalled();
      expect(lessonService.create).toBeCalledWith(mockCreateLessonDto, userId);
    });
  });

  describe('[LessonController.updateLesson] - 수업 수정', () => {
    it('수업 수정 성공', async () => {
      const mockUpdateLesson = Object.assign(mockLesson, mockUpdateLessonDto);

      jest.spyOn(lessonService, 'update').mockResolvedValue(mockUpdateLesson);

      const result = await lessonController.updateLesson(
        lessonId,
        mockUpdateLessonDto,
        userId,
      );

      expect(result).toEqual(mockUpdateLesson);
      expect(lessonService.update).toHaveBeenCalled();
      expect(lessonService.update).toBeCalledWith(
        lessonId,
        mockUpdateLessonDto,
        userId,
      );
    });
  });

  describe('[LessonController.deleteLesson] - 수업 삭제', () => {
    it('수업 삭제 성공', async () => {
      jest.spyOn(lessonService, 'delete').mockResolvedValue(undefined);

      const result = await lessonController.deleteLesson(lessonId, userId);

      expect(result).toBeUndefined();
      expect(lessonService.delete).toHaveBeenCalled();
      expect(lessonService.delete).toBeCalledWith(
        lessonId,

        userId,
      );
    });
  });
});
