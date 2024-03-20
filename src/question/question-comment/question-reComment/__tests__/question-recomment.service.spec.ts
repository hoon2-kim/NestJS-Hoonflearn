import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionCommentEntity } from '@src/question/question-comment/entities/question-comment.entity';
import { QuestionRecommentService } from '@src/question/question-comment/question-reComment/question-recomment.service';
import {
  mockCreatedQuestionComment,
  mockQuestionCommentRepository,
} from '@test/__mocks__/question-comment.mock';
import {
  mockCreatedQuestionReComment,
  mockCreateQuestionReCommentDto,
  mockUpdateQuestionReCommentDto,
} from '@test/__mocks__/question-re-comment.mock';
import { Repository } from 'typeorm';

describe('QuestionRecommentService', () => {
  let questionReCommentService: QuestionRecommentService;
  let questionCommentRepository: Repository<QuestionCommentEntity>;

  const commentId = 'uuid';
  const reCommentId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionRecommentService,
        {
          provide: getRepositoryToken(QuestionCommentEntity),
          useValue: mockQuestionCommentRepository,
        },
      ],
    }).compile();

    questionReCommentService = module.get<QuestionRecommentService>(
      QuestionRecommentService,
    );
    questionCommentRepository = module.get<Repository<QuestionCommentEntity>>(
      getRepositoryToken(QuestionCommentEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(questionReCommentService).toBeDefined();
    expect(questionCommentRepository).toBeDefined();
  });

  describe('[대댓글 생성]', () => {
    it('생성 성공', async () => {
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockResolvedValue(mockCreatedQuestionComment);
      jest
        .spyOn(questionCommentRepository, 'save')
        .mockResolvedValue(mockCreatedQuestionReComment);

      const result = await questionReCommentService.create(
        commentId,
        mockCreateQuestionReCommentDto,
        userId,
      );

      expect(result).toEqual(mockCreatedQuestionReComment);
      expect(questionCommentRepository.save).toBeCalledTimes(1);
    });

    it('생성 실패 - 해당 댓글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionCommentRepository, 'findOne').mockResolvedValue(null);

      try {
        await questionReCommentService.create(
          commentId,
          mockCreateQuestionReCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(questionCommentRepository.save).not.toBeCalled();
      }
    });

    it('생성 실패 - 대댓글 까지만 가능(400에러)', async () => {
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockRejectedValue(new BadRequestException());

      try {
        await questionReCommentService.create(
          commentId,
          mockCreateQuestionReCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(questionCommentRepository.save).not.toBeCalled();
      }
    });
  });

  describe('[대댓글 수정]', () => {
    const updateResult = { message: '수정 성공' };
    it('수정 성공', async () => {
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockResolvedValue(mockCreatedQuestionComment);
      jest
        .spyOn(questionCommentRepository, 'save')
        .mockResolvedValue(mockCreatedQuestionReComment);

      const result = await questionReCommentService.update(
        reCommentId,
        mockUpdateQuestionReCommentDto,
        userId,
      );

      expect(result).toEqual(updateResult);
      expect(questionCommentRepository.save).toBeCalledTimes(1);
    });

    it('수정 실패 - 해당 대댓글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionCommentRepository, 'findOne').mockResolvedValue(null);

      try {
        await questionReCommentService.update(
          reCommentId,
          mockUpdateQuestionReCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(questionCommentRepository.save).not.toBeCalled();
      }
    });

    it('수정 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockRejectedValue(new ForbiddenException());

      try {
        await questionReCommentService.update(
          reCommentId,
          mockUpdateQuestionReCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(questionCommentRepository.save).not.toBeCalled();
      }
    });
  });

  describe('[대댓글 삭제]', () => {
    it('삭제 성공', async () => {
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockResolvedValue(mockCreatedQuestionReComment);
      jest
        .spyOn(questionCommentRepository, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await questionReCommentService.delete(reCommentId, userId);

      expect(result).toBe(true);
      expect(questionCommentRepository.delete).toBeCalledTimes(1);
    });

    it('삭제 실패 - 해당 대댓글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionCommentRepository, 'findOne').mockResolvedValue(null);

      try {
        await questionReCommentService.delete(reCommentId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(questionCommentRepository.delete).not.toBeCalled();
      }
    });

    it('삭제 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(questionCommentRepository, 'findOne')
        .mockRejectedValue(new ForbiddenException());

      try {
        await questionReCommentService.delete(reCommentId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(questionCommentRepository.delete).not.toBeCalled();
      }
    });
  });
});
