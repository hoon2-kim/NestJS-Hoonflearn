import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionCommentDto {
  @ApiProperty({ description: '질문글 댓글 내용' })
  @IsString()
  @IsNotEmpty()
  contents: string;
}
