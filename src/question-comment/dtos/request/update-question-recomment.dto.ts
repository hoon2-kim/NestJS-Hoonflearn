import { PartialType } from '@nestjs/swagger';
import { CreateQuestionReCommentDto } from '@src/question-comment/dtos/request/create-question-recomment.dto';

export class UpdateQuestionReCommentDto extends PartialType(
  CreateQuestionReCommentDto,
) {}
