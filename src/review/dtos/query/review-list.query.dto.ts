import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionDto } from 'src/common/dtos/page-option.dto';
import { EReviewSortBy } from '../../enums/review.enum';

export class ReviewListQueryDto extends PageOptionDto {
  @ApiPropertyOptional({
    enum: EReviewSortBy,
    enumName: 'EReviewSortBy',
    description: '최신순/좋아요순/평점높은순/평점낮은순 정렬',
  })
  @IsOptional()
  @IsEnum(EReviewSortBy)
  sort?: EReviewSortBy;
}
