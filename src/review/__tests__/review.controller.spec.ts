import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from '@src/review/review.controller';
import { ReviewService } from '@src/review/review.service';
import {
  expectedReviewsByCourse,
  mockCreatedReview,
  mockCreateReviewDto,
  mockReviewService,
  mockUpdateReviewDto,
} from '@test/__mocks__/review.mock';
import { ReviewListQueryDto } from '@src/review/dtos/review-list.query.dto';

describe('ReviewController', () => {
  let reviewController: ReviewController;
  let reviewService: ReviewService;

  const courseId = 'uuid';
  const userId = 'uuid';
  const reviewId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [{ provide: ReviewService, useValue: mockReviewService }],
    }).compile();

    reviewController = module.get<ReviewController>(ReviewController);
    reviewService = module.get<ReviewService>(ReviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(reviewController).toBeDefined();
    expect(reviewService).toBeDefined();
  });

  describe('[ReviewController.findAllReviewsByCourse] - 해당 강의의 리뷰 조회', () => {
    it('조회 성공', async () => {
      jest
        .spyOn(reviewService, 'findAllByCourse')
        .mockResolvedValue(expectedReviewsByCourse);

      const result = await reviewController.findAllReviewsByCourse(
        courseId,
        new ReviewListQueryDto(),
      );

      expect(result).toEqual(expectedReviewsByCourse);
      expect(reviewService.findAllByCourse).toBeCalled();
      expect(reviewService.findAllByCourse).toBeCalledWith(
        courseId,
        new ReviewListQueryDto(),
      );
    });
  });

  describe('[ReviewController.createReview] - 리뷰 작성', () => {
    it('작성 성공', async () => {
      jest.spyOn(reviewService, 'create').mockResolvedValue(mockCreatedReview);

      const result = await reviewController.createReview(
        mockCreateReviewDto,
        userId,
      );

      expect(result).toEqual(mockCreatedReview);
      expect(reviewService.create).toBeCalled();
      expect(reviewService.create).toBeCalledWith(mockCreateReviewDto, userId);
    });
  });

  describe('[ReviewController.addOrCancelReviewLike] - 리뷰 좋아요 또는 취소', () => {
    it('좋아요 또는 취소 성공', async () => {
      jest.spyOn(reviewService, 'addOrCancelLike').mockResolvedValue(undefined);

      const result = await reviewController.addOrCancelReviewLike(
        reviewId,
        userId,
      );

      expect(result).toBeUndefined();
      expect(reviewService.addOrCancelLike).toBeCalled();
      expect(reviewService.addOrCancelLike).toBeCalledWith(reviewId, userId);
    });
  });

  describe('[ReviewController.updateReview] - 리뷰 수정', () => {
    const updateResult = { message: '수정 성공' };
    it('수정 성공', async () => {
      jest.spyOn(reviewService, 'update').mockResolvedValue(updateResult);

      const result = await reviewController.updateReview(
        reviewId,
        mockUpdateReviewDto,
        userId,
      );

      expect(result).toEqual(updateResult);
      expect(reviewService.update).toBeCalled();
      expect(reviewService.update).toBeCalledWith(
        reviewId,
        mockUpdateReviewDto,
        userId,
      );
    });
  });

  describe('[ReviewController.deleteReview] - 리뷰 삭제', () => {
    it('삭제 성공', async () => {
      jest.spyOn(reviewService, 'delete').mockResolvedValue(true);

      const result = await reviewController.deleteReview(reviewId, userId);

      expect(result).toBe(true);
      expect(reviewService.delete).toBeCalled();
      expect(reviewService.delete).toBeCalledWith(reviewId, userId);
    });
  });
});
