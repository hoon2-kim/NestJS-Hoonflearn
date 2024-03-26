import { Test, TestingModule } from '@nestjs/testing';
import { QuestionCommentController } from '@src/question/question-comment/question-comment.controller';
import { QuestionCommentService } from '@src/question/question-comment/question-comment.service';
import {
  mockCreateQuestionCommentDto,
  mockQuestionComment,
  mockUpdateQuestionCommentDto,
} from '@test/__mocks__/mock-data';
import { mockQuestionCommentService } from '@test/__mocks__/mock-service';

describe('QuestionCommentController', () => {
  let questionCommentController: QuestionCommentController;
  let questionCommentService: QuestionCommentService;

  const questionId = 'uuid';
  const userId = 'uuid';
  const commentId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionCommentController],
      providers: [
        {
          provide: QuestionCommentService,
          useValue: mockQuestionCommentService,
        },
      ],
    }).compile();

    questionCommentController = module.get<QuestionCommentController>(
      QuestionCommentController,
    );
    questionCommentService = module.get<QuestionCommentService>(
      QuestionCommentService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(questionCommentController).toBeDefined();
    expect(questionCommentService).toBeDefined();
  });

  describe('[QuestionCommentController.createQuestionComment] - 질문글 댓글 생성', () => {
    it('생성 성공', async () => {
      jest
        .spyOn(questionCommentService, 'create')
        .mockResolvedValue(mockQuestionComment);

      const result = await questionCommentController.createQuestionComment(
        questionId,
        mockCreateQuestionCommentDto,
        userId,
      );

      expect(result).toEqual(mockQuestionComment);
      expect(questionCommentService.create).toBeCalled();
      expect(questionCommentService.create).toBeCalledWith(
        questionId,
        mockCreateQuestionCommentDto,
        userId,
      );
    });
  });

  describe('[QuestionCommentController.updateQuestionComment] - 질문글 댓글 수정', () => {
    it('수정 성공', async () => {
      const mockUpdateQuestionComment = Object.assign(
        mockQuestionComment,
        mockUpdateQuestionCommentDto,
      );

      jest
        .spyOn(questionCommentService, 'update')
        .mockResolvedValue(mockUpdateQuestionComment);

      const result = await questionCommentController.updateQuestionComment(
        questionId,
        commentId,
        mockUpdateQuestionCommentDto,
        userId,
      );

      expect(result).toEqual(mockUpdateQuestionComment);
      expect(questionCommentService.update).toBeCalled();
      expect(questionCommentService.update).toBeCalledWith(
        questionId,
        commentId,
        mockUpdateQuestionCommentDto,
        userId,
      );
    });
  });

  describe('[QuestionCommentController.deleteQuestionComment] - 질문글 댓글 삭제', () => {
    it('삭제 성공', async () => {
      jest.spyOn(questionCommentService, 'delete').mockResolvedValue(undefined);

      const result = await questionCommentController.deleteQuestionComment(
        questionId,
        commentId,
        userId,
      );

      expect(result).toBeUndefined();
      expect(questionCommentService.delete).toBeCalled();
      expect(questionCommentService.delete).toBeCalledWith(
        questionId,
        commentId,
        userId,
      );
    });
  });
});
