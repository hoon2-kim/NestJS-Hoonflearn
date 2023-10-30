import { CreateReviewCommentDto } from '@src/review-comment/dtos/request/create-review-comment.dto';
import { UpdateReviewCommentDto } from '@src/review-comment/dtos/request/update-review-comment.dto';
import { ReviewCommentEntity } from '@src/review-comment/entities/review-comment.entity';

export const mockCreateReviewCommentDto: CreateReviewCommentDto = {
  contents: '댓글',
};

export const mockUpdateReviewCommentDto: UpdateReviewCommentDto = {
  contents: '수정',
};

export const mockCreatedReviewComment = {
  id: 'uuid',
  contents: '리뷰댓글',
  fk_user_id: 'uuid',
  fk_review_id: 'uuid',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
} as ReviewCommentEntity;

export const mockReviewCommentRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

export const mockReviewService = {
  findOneByOptions: jest.fn(),
};

export const mockCourseUserService = {
  validateBoughtCourseByUser: jest.fn(),
};

export const mockReviewCommentService = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
