import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateQuestionCommentDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
