import { Test, TestingModule } from '@nestjs/testing';
import { ReviewLikeService } from '@src/review-like/review-like.service';
import { DataSource, Repository } from 'typeorm';
import { ReviewLikeEntity } from '@src/review-like/entities/review-like.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockReviewLike,
  mockReviewLikeRepository,
} from '@test/__mocks__/reviewLike.mock';
import { ReviewEntity } from '@src/review/entities/review.entity';

describe('ReviewLikeService', () => {
  let reviewLikeService: ReviewLikeService;
  let reviewLikeRepository: Repository<ReviewLikeEntity>;
  let dataSource: DataSource;

  const mockDataSource = {
    transaction: jest.fn(),
  };
  const reviewId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewLikeService,
        {
          provide: getRepositoryToken(ReviewLikeEntity),
          useValue: mockReviewLikeRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    reviewLikeService = module.get<ReviewLikeService>(ReviewLikeService);
    reviewLikeRepository = module.get<Repository<ReviewLikeEntity>>(
      getRepositoryToken(ReviewLikeEntity),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(reviewLikeService).toBeDefined();
    expect(reviewLikeRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('toggleReviewLikeStatus(좋아요엔티티 및 좋아요수 로직)테스트', () => {
    let isLike: boolean;
    const upadteResult = { generatedMaps: [], raw: [], affected: 1 };
    const mockSave = jest.fn().mockResolvedValue(mockReviewLike);
    const mockDelete = jest.fn().mockResolvedValue({ affected: 1 });
    const mockIncOrDec = jest.fn().mockResolvedValue(upadteResult);

    it('좋아요 하는 경우 - 좋아요엔티티 저장 및 좋아요 수 증가', async () => {
      isLike = false;

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const manager = { save: mockSave, increment: mockIncOrDec };

        return await cb(manager);
      });

      const result = await reviewLikeService.toggleReviewLikeStatus(
        reviewId,
        userId,
        isLike,
      );

      expect(result).toBeUndefined();
      expect(mockSave).toBeCalled();
      expect(mockSave).toBeCalledWith(ReviewLikeEntity, {
        fk_review_id: reviewId,
        fk_user_id: userId,
      });
      expect(mockIncOrDec).toBeCalled();
      expect(mockIncOrDec).toBeCalledWith(
        ReviewEntity,
        { id: reviewId },
        'likeCount',
        1,
      );
    });

    it('좋아요 취소 하는 경우 - 좋아요엔티티 저장 및 좋아요 수 증가', async () => {
      isLike = true;

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const manager = { delete: mockDelete, decrement: mockIncOrDec };
        return await cb(manager);
      });

      const result = await reviewLikeService.toggleReviewLikeStatus(
        reviewId,
        userId,
        isLike,
      );

      expect(result).toBeUndefined();
      expect(mockDelete).toBeCalled();
      expect(mockDelete).toBeCalledWith(ReviewLikeEntity, {
        fk_review_id: reviewId,
        fk_user_id: userId,
      });
      expect(mockIncOrDec).toBeCalled();
      expect(mockIncOrDec).toBeCalledWith(
        ReviewEntity,
        { id: reviewId },
        'likeCount',
        1,
      );
    });
  });
});
