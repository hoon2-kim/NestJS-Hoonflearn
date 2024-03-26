import { Test, TestingModule } from '@nestjs/testing';
import { ReviewCommentController } from '@src/review/review-comment/review-comment.controller';
import { ReviewCommentService } from '@src/review/review-comment/review-comment.service';
import {
  mockReviewComment,
  mockCreateReviewCommentDto,
  mockUpdateReviewCommentDto,
} from '@test/__mocks__/mock-data';
import { mockReviewCommentService } from '@test/__mocks__/mock-service';

describe('ReviewCommentController', () => {
  let reviewCommentController: ReviewCommentController;
  let reviewCommentService: ReviewCommentService;

  const reviewId = 'uuid';
  const commentId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewCommentController],
      providers: [
        { provide: ReviewCommentService, useValue: mockReviewCommentService },
      ],
    }).compile();

    reviewCommentController = module.get<ReviewCommentController>(
      ReviewCommentController,
    );
    reviewCommentService =
      module.get<ReviewCommentService>(ReviewCommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(reviewCommentController).toBeDefined();
    expect(reviewCommentService).toBeDefined();
  });

  describe('[ReviewCommentController.createReviewComment] - 리뷰 댓글 생성', () => {
    it('생성 성공', async () => {
      jest
        .spyOn(reviewCommentService, 'create')
        .mockResolvedValue(mockReviewComment);

      const result = await reviewCommentController.createReviewComment(
        reviewId,
        mockCreateReviewCommentDto,
        userId,
      );

      expect(result).toEqual(mockReviewComment);
      expect(reviewCommentService.create).toBeCalled();
      expect(reviewCommentService.create).toBeCalledWith(
        reviewId,
        mockCreateReviewCommentDto,
        userId,
      );
    });
  });

  describe('[ReviewCommentController.updateReviewComment] - 리뷰 댓글 수정', () => {
    it('수정 성공', async () => {
      const mockUpdateReviewComment = Object.assign(
        mockReviewComment,
        mockUpdateReviewCommentDto,
      );

      jest
        .spyOn(reviewCommentService, 'update')
        .mockResolvedValue(mockUpdateReviewComment);

      const result = await reviewCommentController.updateReviewCommet(
        reviewId,
        commentId,
        mockUpdateReviewCommentDto,
        userId,
      );

      expect(result).toEqual(mockUpdateReviewComment);
      expect(reviewCommentService.update).toBeCalled();
      expect(reviewCommentService.update).toBeCalledWith(
        reviewId,
        commentId,
        mockUpdateReviewCommentDto,
        userId,
      );
    });
  });

  describe('[ReviewCommentController.deleteReviewComment] - 리뷰 댓글 삭제', () => {
    it('삭제 성공', async () => {
      jest.spyOn(reviewCommentService, 'delete').mockResolvedValue(undefined);

      const result = await reviewCommentController.deleteReviewCommet(
        reviewId,
        commentId,
        userId,
      );

      expect(result).toBeUndefined();
      expect(reviewCommentService.delete).toBeCalled();
      expect(reviewCommentService.delete).toBeCalledWith(
        reviewId,
        commentId,
        userId,
      );
    });
  });
});
