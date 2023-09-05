import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EQuestionStatus } from '../../enums/question.enum';

export class QuestionStatusDto {
  @ApiProperty({
    description: '질문글 해결/미해결 상태',
    enum: EQuestionStatus,
    enumName: 'EQuestionStatus',
  })
  @IsEnum(EQuestionStatus)
  @IsNotEmpty()
  status: EQuestionStatus;
}
