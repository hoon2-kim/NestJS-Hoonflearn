import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from '@src/lesson/lesson.controller';
import {
  mockCreatedLesson,
  mockCreateLessonDto,
  mockLessonService,
  mockLessonWithVideo,
  mockUpdateLessonDto,
} from '@test/__mocks__/lesson.mock';
import { LessonService } from '@src/lesson/lesson.service';
import { LessonResponseDto } from '@src/lesson/dtos/response/lesson.response.dto';
import { mockCreatedUser } from '@test/__mocks__/user.mock';

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
      const lessonResponse = LessonResponseDto.from(mockLessonWithVideo);
      jest.spyOn(lessonService, 'viewLesson').mockResolvedValue(lessonResponse);

      const result = await lessonController.viewLesson(
        lessonId,
        mockCreatedUser,
      );

      expect(result).toEqual(lessonResponse);
      expect(lessonService.viewLesson).toHaveBeenCalled();
      expect(lessonService.viewLesson).toBeCalledWith(
        lessonId,
        mockCreatedUser,
      );
    });
  });

  describe('[LessonController.createLesson] - 수업 생성', () => {
    it('수업 생성 성공', async () => {
      jest.spyOn(lessonService, 'create').mockResolvedValue(mockCreatedLesson);

      const result = await lessonController.createLesson(
        mockCreateLessonDto,
        userId,
      );

      expect(result).toEqual(mockCreatedLesson);
      expect(lessonService.create).toHaveBeenCalled();
      expect(lessonService.create).toBeCalledWith(mockCreateLessonDto, userId);
    });
  });

  describe('[LessonController.updateLesson] - 수업 수정', () => {
    const updateResult = { message: '수정 성공' };
    it('수업 수정 성공', async () => {
      jest.spyOn(lessonService, 'update').mockResolvedValue(updateResult);

      const result = await lessonController.updateLesson(
        lessonId,
        mockUpdateLessonDto,
        userId,
      );

      expect(result).toEqual(updateResult);
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
      jest.spyOn(lessonService, 'delete').mockResolvedValue(true);

      const result = await lessonController.deleteLesson(lessonId, userId);

      expect(result).toBe(true);
      expect(lessonService.delete).toHaveBeenCalled();
      expect(lessonService.delete).toBeCalledWith(
        lessonId,

        userId,
      );
    });
  });
});
