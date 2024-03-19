import { PartialType } from '@nestjs/swagger';
import { CreateReviewCommentDto } from '@src/review/review-comment/dtos/create-review-comment.dto';

export class UpdateReviewCommentDto extends PartialType(
  CreateReviewCommentDto,
) {}
