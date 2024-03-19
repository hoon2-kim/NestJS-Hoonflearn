import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    example: 'b0d2623e-ab86-4112-85f5-5c5edd179c20',
    description: '강의 ID',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '질문글 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '질문글 내용' })
  @IsString()
  @IsNotEmpty()
  contents: string;
}
