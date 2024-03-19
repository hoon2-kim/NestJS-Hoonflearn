import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewCommentDto {
  @ApiProperty({ description: '리뷰 댓글 내용' })
  @IsString()
  @IsNotEmpty()
  contents: string;
}
