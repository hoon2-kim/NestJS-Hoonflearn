import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EQuestionVoteDtoType } from '@src/question/question-vote/enums/question-vote.enum';

export class QuestionVoteDto {
  @ApiProperty({
    description: '질문글 추천 / 비추천',
    enum: EQuestionVoteDtoType,
    enumName: 'EQuestionVoteDtoType',
  })
  @IsEnum(EQuestionVoteDtoType)
  @IsNotEmpty()
  vote: EQuestionVoteDtoType;
}
