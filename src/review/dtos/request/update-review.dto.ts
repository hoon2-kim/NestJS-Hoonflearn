import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateReviewDto } from '@src/review/dtos/request/create-review.dto';

export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ['courseId'] as const),
) {
  @IsOptional()
  rating?: number;

  @IsOptional()
  contents?: string;
}
