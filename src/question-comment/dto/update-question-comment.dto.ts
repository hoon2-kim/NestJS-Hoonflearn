import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateQuestionCommentDto } from './create-question-comment.dto';

export class UpdateQuestionCommentDto extends PartialType(
  OmitType(CreateQuestionCommentDto, ['questionId'] as const),
) {}
