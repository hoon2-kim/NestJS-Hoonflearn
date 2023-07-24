import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReviewCommentDto {
  @IsUUID()
  @IsNotEmpty()
  reviewId: string;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
