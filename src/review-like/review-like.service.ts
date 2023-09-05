import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { ReviewLikeEntity } from './entities/review-like.entity';

@Injectable()
export class ReviewLikeService {
  constructor(
    @InjectRepository(ReviewLikeEntity)
    private readonly reviewLikeRepository: Repository<ReviewLikeEntity>,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<ReviewLikeEntity>,
  ): Promise<ReviewLikeEntity | null> {
    const reviewLike: ReviewLikeEntity | null =
      await this.reviewLikeRepository.findOne(options);

    return reviewLike;
  }

  async addReviewLike(reviewId: string, userId: string): Promise<void> {
    await this.reviewLikeRepository.save({
      fk_review_id: reviewId,
      fk_user_id: userId,
    });
  }

  async cancelReviewLike(reviewd: string, userId: string): Promise<void> {
    await this.reviewLikeRepository.delete({
      fk_review_id: reviewd,
      fk_user_id: userId,
    });
  }
}
