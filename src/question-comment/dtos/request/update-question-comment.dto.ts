import { PartialType } from '@nestjs/swagger';
import { CreateQuestionCommentDto } from '@src/question-comment/dtos/request/create-question-comment.dto';

export class UpdateQuestionCommentDto extends PartialType(
  CreateQuestionCommentDto,
) {}
