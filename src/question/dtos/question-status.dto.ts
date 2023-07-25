import { IsEnum, IsNotEmpty } from 'class-validator';
import { QuestionStatusType } from '../entities/question.entity';

export class QuestionStatusDto {
  @IsEnum(QuestionStatusType)
  @IsNotEmpty()
  status: QuestionStatusType;
}
