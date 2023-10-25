import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from '@src/review/entities/review.entity';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { ReviewLikeEntity } from '@src/review-like/entities/review-like.entity';

@Injectable()
export class ReviewLikeService {
  constructor(
    @InjectRepository(ReviewLikeEntity)
    private readonly reviewLikeRepository: Repository<ReviewLikeEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<ReviewLikeEntity>,
  ): Promise<ReviewLikeEntity | null> {
    const reviewLike: ReviewLikeEntity | null =
      await this.reviewLikeRepository.findOne(options);

    return reviewLike;
  }

  async toggleReviewLikeStatus(
    reviewId: string,
    userId: string,
    isLike: boolean,
  ): Promise<void> {
    // 콜백기반의 트랜잭션 처리 - 간단한 트랜잭션 로직에 사용
    await this.dataSource.transaction(async (manager) => {
      if (isLike) {
        await manager.delete(ReviewLikeEntity, {
          fk_review_id: reviewId,
          fk_user_id: userId,
        });

        await manager.decrement(ReviewEntity, { id: reviewId }, 'likeCount', 1);

        return;
      }

      await manager.save(ReviewLikeEntity, {
        fk_review_id: reviewId,
        fk_user_id: userId,
      });

      await manager.increment(ReviewEntity, { id: reviewId }, 'likeCount', 1);
    });
  }
}
