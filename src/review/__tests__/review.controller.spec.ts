import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from '@src/review/review.controller';
import { ReviewService } from '@src/review/review.service';
import { ReviewListQueryDto } from '@src/review/dtos/review-list.query.dto';
import { mockReviewService } from '@test/__mocks__/mock-service';
import {
  mockCreateReviewDto,
  mockReview,
  mockReviewComment,
  mockUpdateReviewDto,
  mockUserByEmail,
  mockUserByGoogle,
} from '@test/__mocks__/mock-data';
import { ReviewEntity } from '@src/review/entities/review.entity';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';

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
      const mockReviewListByCourse = [
        [
          {
            ...mockReview,
            user: mockUserByEmail,
            reviewComments: [
              {
                ...mockReviewComment,
                user: mockUserByGoogle,
              },
            ],
          },
        ],
        1,
      ] as [ReviewEntity[], number];
      const pageMeta = new PageMetaDto({
        pageOptionDto: new ReviewListQueryDto(),
        itemCount: mockReviewListByCourse[1],
      });
      const expectedReviewListByCourse = new PageDto(
        mockReviewListByCourse[0],
        pageMeta,
      );

      jest
        .spyOn(reviewService, 'findAllByCourse')
        .mockResolvedValue(expectedReviewListByCourse);

      const result = await reviewController.findAllReviewsByCourse(
        courseId,
        new ReviewListQueryDto(),
      );

      expect(result).toEqual(expectedReviewListByCourse);
      expect(reviewService.findAllByCourse).toBeCalled();
      expect(reviewService.findAllByCourse).toBeCalledWith(
        courseId,
        new ReviewListQueryDto(),
      );
    });
  });

  describe('[ReviewController.createReview] - 리뷰 작성', () => {
    it('작성 성공', async () => {
      jest.spyOn(reviewService, 'create').mockResolvedValue(mockReview);

      const result = await reviewController.createReview(
        mockCreateReviewDto,
        userId,
      );

      expect(result).toEqual(mockReview);
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
    it('수정 성공', async () => {
      jest.spyOn(reviewService, 'update').mockResolvedValue(undefined);

      const result = await reviewController.updateReview(
        reviewId,
        mockUpdateReviewDto,
        userId,
      );

      expect(result).toBeUndefined();
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
      jest.spyOn(reviewService, 'delete').mockResolvedValue(undefined);

      const result = await reviewController.deleteReview(reviewId, userId);

      expect(result).toBeUndefined();
      expect(reviewService.delete).toBeCalled();
      expect(reviewService.delete).toBeCalledWith(reviewId, userId);
    });
  });
});
