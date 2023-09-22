import { PartialType } from '@nestjs/swagger';
import { CreateReviewCommentDto } from '@src/review-comment/dtos/request/create-review-comment.dto';

export class UpdateReviewCommentDto extends PartialType(
  CreateReviewCommentDto,
) {}
