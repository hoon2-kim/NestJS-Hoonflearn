import { ReviewLikeEntity } from '@src/review-like/entities/review-like.entity';

export const mockReviewLike = {
  id: 'uuid',
  fk_review_id: 'uuid',
  fk_user_id: 'uuid',
  created_at: new Date('2023-10'),
} as ReviewLikeEntity;

export const mockReviewLikeRepository = {
  findOne: jest.fn(),
};
