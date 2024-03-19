import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionDto } from '@src/common/dtos/page-option.dto';
import {
  EQuestionSortBy,
  EQuestionStatus,
} from '@src/question/enums/question.enum';

export class QuestionListQueryDto extends PageOptionDto {
  @ApiPropertyOptional({
    enum: EQuestionStatus,
    enumName: 'EQuestionStatus',
    description: '해결/미해결 필터링',
  })
  @IsOptional()
  @IsEnum(EQuestionStatus)
  status?: EQuestionStatus;

  @ApiPropertyOptional({ description: '검색어' })
  @IsOptional()
  @IsString()
  s: string;

  @ApiPropertyOptional({
    enum: EQuestionSortBy,
    enumName: 'EQuestionSortBy',
    description: '댓글많은순/투표(추천)많은순/최신순/오래된순',
  })
  @IsOptional()
  @IsEnum(EQuestionSortBy)
  sort?: EQuestionSortBy;
}
