import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionCommentService } from '@src/question/question-comment/question-comment.service';
import { QuestionService } from '@src/question/question.service';
import {
  mockCreatedQuestionComment,
  mockCreateQuestionCommentDto,
  mockQuestionCommentRepository,
  mockQuestionService,
  mockUpdateQuestionCommentDto,
} from '@test/__mocks__/question-comment.mock';
import { mockCreatedQuestion } from '@test/__mocks__/question.mock';
import { Repository } from 'typeorm';
import { QuestionCommentEntity } from '@src/question/question-comment/entities/question-comment.entity';

describe('QuestionCommentService', () => {
  let questionCommentService: QuestionCommentService;
  let questionCommentRepository: Repository<QuestionCommentEntity>;
  let questionService: QuestionService;

  const questionId = 'uuid';
  const userId = 'uuid';
  const commentId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionCommentService,
        {
          provide: getRepositoryToken(QuestionCommentEntity),
          useValue: mockQuestionCommentRepository,
        },
        { provide: QuestionService, useValue: mockQuestionService },
      ],
    }).compile();

    questionCommentService = module.get<QuestionCommentService>(
      QuestionCommentService,
    );
    questionCommentRepository = module.get<Repository<QuestionCommentEntity>>(
      getRepositoryToken(QuestionCommentEntity),
    );
    questionService = module.get<QuestionService>(QuestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(questionCommentService).toBeDefined();
    expect(questionCommentRepository).toBeDefined();
    expect(questionService).toBeDefined();
  });

  describe('[댓글 생성]', () => {
    it('생성 성공', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionCommentRepository, 'save')
        .mockResolvedValue(mockCreatedQuestionComment);

      const result = await questionCommentService.create(
        questionId,
        mockCreateQuestionCommentDto,
        userId,
      );

      expect(result).toEqual(mockCreatedQuestionComment);
      expect(questionCommentRepository.save).toBeCalledTimes(1);
    });

    it('생성 실패 - 해당 질문글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionCommentService.create(
          questionId,
          mockCreateQuestionCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(questionCommentRepository.save).not.toBeCalled();
      }
    });
  });

  describe('[댓글 수정]', () => {
    const updateResult = { message: '수정 성공' };
    it('수정 성공', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockResolvedValue(mockCreatedQuestionComment);
      jest
        .spyOn(questionCommentRepository, 'save')
        .mockResolvedValue(mockCreatedQuestionComment);

      const result = await questionCommentService.update(
        questionId,
        commentId,
        mockUpdateQuestionCommentDto,
        userId,
      );

      expect(result).toEqual(updateResult);
      expect(questionCommentRepository.save).toBeCalledTimes(1);
    });

    it('수정 실패 - 해당 질문글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionCommentService.update(
          questionId,
          commentId,
          mockUpdateQuestionCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(questionCommentRepository.save).not.toBeCalled();
      }
    });

    it('수정 실패 - 해당 댓글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);
      jest.spyOn(questionCommentRepository, 'findOne').mockResolvedValue(null);

      try {
        await questionCommentService.update(
          questionId,
          commentId,
          mockUpdateQuestionCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(questionCommentRepository.save).not.toBeCalled();
      }
    });

    it('수정 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockRejectedValue(new ForbiddenException());

      try {
        await questionCommentService.update(
          questionId,
          commentId,
          mockUpdateQuestionCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(questionCommentRepository.save).not.toBeCalled();
      }
    });
  });

  describe('[댓글 삭제]', () => {
    it('삭제 성공', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockResolvedValue(mockCreatedQuestionComment);
      jest
        .spyOn(questionCommentRepository, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await questionCommentService.delete(
        questionId,
        commentId,
        userId,
      );

      expect(result).toBe(true);
      expect(questionCommentRepository.delete).toBeCalledTimes(1);
    });

    it('삭제 실패 - 해당 질문글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionCommentService.delete(questionId, commentId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(questionCommentRepository.delete).not.toBeCalled();
      }
    });

    it('삭제 실패 - 해당 댓글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);
      jest.spyOn(questionCommentRepository, 'findOne').mockResolvedValue(null);

      try {
        await questionCommentService.delete(questionId, commentId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(questionCommentRepository.delete).not.toBeCalled();
      }
    });

    it('삭제 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockRejectedValue(new ForbiddenException());

      try {
        await questionCommentService.delete(questionId, commentId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(questionCommentRepository.delete).not.toBeCalled();
      }
    });
  });
});
