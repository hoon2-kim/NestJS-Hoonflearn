import { Test, TestingModule } from '@nestjs/testing';
import { QuestionCommentController } from '@src/question-comment/question-comment.controller';
import {
  mockCreatedQuestionComment,
  mockCreateQuestionCommentDto,
  mockQuestionCommentService,
  mockUpdateQuestionCommentDto,
} from '@test/__mocks__/question-comment.mock';
import { QuestionCommentService } from '@src/question-comment/question-comment.service';

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
        .mockResolvedValue(mockCreatedQuestionComment);

      const result = await questionCommentController.createQuestionComment(
        questionId,
        mockCreateQuestionCommentDto,
        userId,
      );

      expect(result).toEqual(mockCreatedQuestionComment);
      expect(questionCommentService.create).toBeCalled();
      expect(questionCommentService.create).toBeCalledWith(
        questionId,
        mockCreateQuestionCommentDto,
        userId,
      );
    });
  });

  describe('[QuestionCommentController.updateQuestionComment] - 질문글 댓글 수정', () => {
    const updateResult = { message: '수정 성공' };

    it('수정 성공', async () => {
      jest
        .spyOn(questionCommentService, 'update')
        .mockResolvedValue(updateResult);

      const result = await questionCommentController.updateQuestionComment(
        questionId,
        commentId,
        mockUpdateQuestionCommentDto,
        userId,
      );

      expect(result).toEqual(updateResult);
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
      jest.spyOn(questionCommentService, 'delete').mockResolvedValue(true);

      const result = await questionCommentController.deleteQuestionComment(
        questionId,
        commentId,
        userId,
      );

      expect(result).toBe(true);
      expect(questionCommentService.delete).toBeCalled();
      expect(questionCommentService.delete).toBeCalledWith(
        questionId,
        commentId,
        userId,
      );
    });
  });
});
