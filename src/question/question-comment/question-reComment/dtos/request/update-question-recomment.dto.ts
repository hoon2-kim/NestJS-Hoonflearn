import { PartialType } from '@nestjs/swagger';
import { CreateQuestionReCommentDto } from '@src/question/question-comment/question-reComment/dtos/request/create-question-recomment.dto';

export class UpdateQuestionReCommentDto extends PartialType(
  CreateQuestionReCommentDto,
) {}
