import { Test, TestingModule } from '@nestjs/testing';
import { ReviewCommentController } from '@src/review/review-comment/review-comment.controller';
import { ReviewCommentService } from '@src/review/review-comment/review-comment.service';
import {
  mockReviewCommentService,
  mockCreateReviewCommentDto,
  mockUpdateReviewCommentDto,
  mockCreatedReviewComment,
} from '@test/__mocks__/review-comment.mock';

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
        .mockResolvedValue(mockCreatedReviewComment);

      const result = await reviewCommentController.createReviewComment(
        reviewId,
        mockCreateReviewCommentDto,
        userId,
      );

      expect(result).toEqual(mockCreatedReviewComment);
      expect(reviewCommentService.create).toBeCalled();
      expect(reviewCommentService.create).toBeCalledWith(
        reviewId,
        mockCreateReviewCommentDto,
        userId,
      );
    });
  });

  describe('[ReviewCommentController.updateReviewComment] - 리뷰 댓글 수정', () => {
    const updateResult = { message: '수정 성공' };
    it('수정 성공', async () => {
      jest
        .spyOn(reviewCommentService, 'update')
        .mockResolvedValue(updateResult);

      const result = await reviewCommentController.updateReviewCommet(
        reviewId,
        commentId,
        mockUpdateReviewCommentDto,
        userId,
      );

      expect(result).toEqual(updateResult);
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
      jest.spyOn(reviewCommentService, 'delete').mockResolvedValue(true);

      const result = await reviewCommentController.deleteReviewCommet(
        reviewId,
        commentId,
        userId,
      );

      expect(result).toBe(true);
      expect(reviewCommentService.delete).toBeCalled();
      expect(reviewCommentService.delete).toBeCalledWith(
        reviewId,
        commentId,
        userId,
      );
    });
  });
});
