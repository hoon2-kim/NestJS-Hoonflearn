import { Test, TestingModule } from '@nestjs/testing';
import { QuestionRecommentController } from '@src/question/question-comment/question-reComment/question-recomment.controller';
import { QuestionRecommentService } from '@src/question/question-comment/question-reComment/question-recomment.service';
import {
  mockQuestionReComment,
  mockCreateQuestionReCommentDto,
  mockUpdateQuestionReCommentDto,
} from '@test/__mocks__/mock-data';
import { mockQuestionReCommentService } from '@test/__mocks__/mock-service';

describe('QuestionRecommentController', () => {
  let questionReCommentController: QuestionRecommentController;
  let questionReCommentService: QuestionRecommentService;

  const userId = 'uuid';
  const commentId = 'uuid';
  const reCommentId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionRecommentController],
      providers: [
        {
          provide: QuestionRecommentService,
          useValue: mockQuestionReCommentService,
        },
      ],
    }).compile();

    questionReCommentController = module.get<QuestionRecommentController>(
      QuestionRecommentController,
    );
    questionReCommentService = module.get<QuestionRecommentService>(
      QuestionRecommentService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(questionReCommentController).toBeDefined();
    expect(questionReCommentService).toBeDefined();
  });

  describe('[QuestionCommentController.createQuestionReComment] - 질문글 대댓글 생성', () => {
    it('생성 성공', async () => {
      jest
        .spyOn(questionReCommentService, 'create')
        .mockResolvedValue(mockQuestionReComment);

      const result = await questionReCommentController.createQuestionReComment(
        commentId,
        mockCreateQuestionReCommentDto,
        userId,
      );

      expect(result).toEqual(mockQuestionReComment);
      expect(questionReCommentService.create).toBeCalled();
      expect(questionReCommentService.create).toBeCalledWith(
        commentId,
        mockCreateQuestionReCommentDto,
        userId,
      );
    });
  });

  describe('[QuestionCommentController.updateQuestionReComment] - 질문글 대댓글 수정', () => {
    it('수정 성공', async () => {
      const mockUpdateQuestionReComment = Object.assign(
        mockQuestionReComment,
        mockUpdateQuestionReCommentDto,
      );

      jest
        .spyOn(questionReCommentService, 'update')
        .mockResolvedValue(mockUpdateQuestionReComment);

      const result = await questionReCommentController.updateQuestionReComment(
        reCommentId,
        mockUpdateQuestionReCommentDto,
        userId,
      );

      expect(result).toEqual(mockUpdateQuestionReComment);
      expect(questionReCommentService.update).toBeCalled();
      expect(questionReCommentService.update).toBeCalledWith(
        reCommentId,
        mockUpdateQuestionReCommentDto,
        userId,
      );
    });
  });

  describe('[QuestionCommentController.deleteQuestionReComment] - 질문글 대댓글 삭제', () => {
    it('삭제 성공', async () => {
      jest
        .spyOn(questionReCommentService, 'delete')
        .mockResolvedValue(undefined);

      const result = await questionReCommentController.deleteQuestionReComment(
        reCommentId,
        userId,
      );

      expect(result).toBeUndefined();
      expect(questionReCommentService.delete).toBeCalled();
      expect(questionReCommentService.delete).toBeCalledWith(
        reCommentId,
        userId,
      );
    });
  });
});
