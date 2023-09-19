import { PartialType } from '@nestjs/swagger';
import { CreateQuestionReCommentDto } from './create-question-recomment.dto';

export class UpdateQuestionReCommentDto extends PartialType(
  CreateQuestionReCommentDto,
) {}
