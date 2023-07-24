import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

export class UpdateQuestionDto extends PartialType(
  OmitType(CreateQuestionDto, ['courseId'] as const),
) {}
