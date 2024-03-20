import { PartialType } from '@nestjs/swagger';
import { CreateQuestionCommentDto } from '@src/question/question-comment/dtos/create-question-comment.dto';

export class UpdateQuestionCommentDto extends PartialType(
  CreateQuestionCommentDto,
) {}
