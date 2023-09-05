import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class UpdateQuestionDto extends PartialType(
  OmitType(CreateQuestionDto, ['courseId'] as const),
) {
  @IsOptional()
  title?: string;

  @IsOptional()
  contents?: string;
}
