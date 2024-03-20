import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from '@src/question/question.controller';
import { QuestionService } from '@src/question/question.service';
import {
  expectedQuestionDetail,
  expectedQuestionWithoutComment,
  mockCreatedQuestion,
  mockCreateQuestionDto,
  mockQuestionService,
  mockUpdateQuestionDto,
} from '@test/__mocks__/question.mock';
import { QuestionListQueryDto } from '@src/question/dtos/question-list.query.dto';
import { QuestionStatusDto } from '@src/question/dtos/question-status.dto';
import { QuestionVoteDto } from '@src/question/dtos/question-vote.dto';

describe('QuestionController', () => {
  let questionController: QuestionController;
  let questionService: QuestionService;

  const courseId = 'uuid';
  const userId = 'uuid';
  const questionId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [{ provide: QuestionService, useValue: mockQuestionService }],
    }).compile();

    questionController = module.get<QuestionController>(QuestionController);
    questionService = module.get<QuestionService>(QuestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(questionController).toBeDefined();
    expect(questionService).toBeDefined();
  });

  describe('[QuestionController.findAllQuestions] - 모든 질문글 조회', () => {
    const query = new QuestionListQueryDto();

    it('조회 성공', async () => {
      jest
        .spyOn(questionService, 'findAll')
        .mockResolvedValue(expectedQuestionWithoutComment);

      const result = await questionController.findAllQuestions(query);

      expect(result).toEqual(expectedQuestionWithoutComment);
      expect(questionService.findAll).toBeCalled();
      expect(questionService.findAll).toBeCalledWith(query);
    });
  });

  describe('[QuestionController.findAllQuestionsByCourse] - 강의의 모든 질문글 조회', () => {
    const query = new QuestionListQueryDto();

    it('조회 성공', async () => {
      jest
        .spyOn(questionService, 'findAllByCourse')
        .mockResolvedValue(expectedQuestionWithoutComment);

      const result = await questionController.findAllQuestionsByCourse(
        courseId,
        query,
      );

      expect(result).toEqual(expectedQuestionWithoutComment);
      expect(questionService.findAllByCourse).toBeCalled();
      expect(questionService.findAllByCourse).toBeCalledWith(courseId, query);
    });
  });

  describe('[QuestionController.findOneQuestion] - 질문글 상세 조회', () => {
    it('조회 성공', async () => {
      jest
        .spyOn(questionService, 'findOne')
        .mockResolvedValue(expectedQuestionDetail);

      const result = await questionController.findOneQuestion(questionId);

      expect(result).toEqual(expectedQuestionDetail);
      expect(questionService.findOne).toBeCalled();
      expect(questionService.findOne).toBeCalledWith(questionId);
    });
  });

  describe('[QuestionController.createQuestion] - 질문글 작성', () => {
    it('작성 성공', async () => {
      jest
        .spyOn(questionService, 'create')
        .mockResolvedValue(mockCreatedQuestion);

      const result = await questionController.createQuestion(
        mockCreateQuestionDto,
        userId,
      );

      expect(result).toEqual(mockCreatedQuestion);
      expect(questionService.create).toBeCalled();
      expect(questionService.create).toBeCalledWith(
        mockCreateQuestionDto,
        userId,
      );
    });
  });

  describe('[QuestionController.createQuestion] - 질문글 작성', () => {
    it('작성 성공', async () => {
      jest
        .spyOn(questionService, 'create')
        .mockResolvedValue(mockCreatedQuestion);

      const result = await questionController.createQuestion(
        mockCreateQuestionDto,
        userId,
      );

      expect(result).toEqual(mockCreatedQuestion);
      expect(questionService.create).toBeCalled();
      expect(questionService.create).toBeCalledWith(
        mockCreateQuestionDto,
        userId,
      );
    });
  });

  describe('[QuestionController.updateQuestionVoteStatus] - 질문글 투표', () => {
    const voteDto = new QuestionVoteDto();

    it('투표 성공', async () => {
      jest
        .spyOn(questionService, 'updateVoteStatus')
        .mockResolvedValue(undefined);

      const result = await questionController.updateQuestionVoteStatus(
        questionId,
        userId,
        voteDto,
      );

      expect(result).toBeUndefined;
      expect(questionService.updateVoteStatus).toBeCalled();
      expect(questionService.updateVoteStatus).toBeCalledWith(
        questionId,
        userId,
        voteDto,
      );
    });
  });

  describe('[QuestionController.updateQuestion] - 질문글 수정', () => {
    const updateResult = { message: '수정 성공' };

    it('수정 성공', async () => {
      jest.spyOn(questionService, 'update').mockResolvedValue(updateResult);

      const result = await questionController.updateQuestion(
        questionId,
        mockUpdateQuestionDto,
        userId,
      );

      expect(result).toEqual(updateResult);
      expect(questionService.update).toBeCalled();
      expect(questionService.update).toBeCalledWith(
        questionId,
        mockUpdateQuestionDto,
        userId,
      );
    });
  });

  describe('[QuestionController.reactionQuestionStatus] - 질문글 상태 바꾸기', () => {
    const statusDto = new QuestionStatusDto();

    it('바꾸기 성공', async () => {
      jest.spyOn(questionService, 'status').mockResolvedValue(undefined);

      const result = await questionController.reactionQuestionStatus(
        questionId,
        statusDto,
        userId,
      );

      expect(result).toBeUndefined();
      expect(questionService.status).toBeCalled();
      expect(questionService.status).toBeCalledWith(
        questionId,
        statusDto,
        userId,
      );
    });
  });

  describe('[QuestionController.deleteQuestion] - 질문글 삭제', () => {
    it('삭제 성공', async () => {
      jest.spyOn(questionService, 'delete').mockResolvedValue(true);

      const result = await questionController.deleteQuestion(
        questionId,
        userId,
      );

      expect(result).toBe(true);
      expect(questionService.delete).toBeCalled();
      expect(questionService.delete).toBeCalledWith(questionId, userId);
    });
  });
});
