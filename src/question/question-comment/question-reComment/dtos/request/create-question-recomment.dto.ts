import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionReCommentDto {
  @ApiProperty({ description: '질문글 대댓글의 내용' })
  @IsString()
  @IsNotEmpty()
  contents: string;
}
