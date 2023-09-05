import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateQuestionReCommentDto {
  @ApiProperty({
    example: '943b0879-45af-4735-bbe0-9ea01fced254',
    description: '질문글 대댓글의 부모 ID',
  })
  @IsUUID()
  @IsNotEmpty()
  parentId: string;

  @ApiProperty({ description: '질문글 대댓글의 내용' })
  @IsString()
  @IsNotEmpty()
  contents: string;
}
