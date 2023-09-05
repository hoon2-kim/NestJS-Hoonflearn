import { PartialType } from '@nestjs/swagger';
import { CreateQuestionCommentDto } from './create-question-comment.dto';

export class UpdateQuestionCommentDto extends PartialType(
  CreateQuestionCommentDto,
) {}
