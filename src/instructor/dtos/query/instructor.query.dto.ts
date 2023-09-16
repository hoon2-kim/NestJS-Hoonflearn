import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PageOptionDto } from 'src/common/dtos/page-option.dto';
import {
  EInstructorQuestionSortBy,
  EInstructorQuestionStatusBy,
  EInstructorReviewSortBy,
} from '../../enums/instructor.enum';

export class InstructorCourseQueryDto extends PageOptionDto {}

export class InstructorQuestionQueryDto extends PageOptionDto {
  @ApiPropertyOptional({ description: '강의ID로 필터링' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    enum: EInstructorQuestionStatusBy,
    enumName: 'EInstructorQuestionStatusBy',
    description: '미해결질문/해결질문/답변한질문/미답변질문 필터링',
  })
  @IsOptional()
  @IsEnum(EInstructorQuestionStatusBy)
  status?: EInstructorQuestionStatusBy;

  @ApiPropertyOptional({
    enum: EInstructorQuestionSortBy,
    enumName: 'EInstructorQuestionSortBy',
    description: '최신순/최근답변순/투표(추천)많은순/오래된순',
  })
  @IsOptional()
  @IsEnum(EInstructorQuestionSortBy)
  sort?: EInstructorQuestionSortBy;
}

export class InstructorReviewQueryDto extends PageOptionDto {
  @ApiPropertyOptional({ description: '강의ID로 필터링' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    enum: EInstructorReviewSortBy,
    enumName: 'EInstructorReviewSortBy',
    description: '최신순/최근답변순/미답변순/좋아요순',
  })
  @IsOptional()
  @IsEnum(EInstructorReviewSortBy)
  sort?: EInstructorReviewSortBy;
}
