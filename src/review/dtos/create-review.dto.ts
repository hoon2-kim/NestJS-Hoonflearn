import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 'b0d2623e-ab86-4112-85f5-5c5edd179c20',
    description: '강의 ID',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '리뷰 내용' })
  @IsString()
  @IsNotEmpty()
  contents: string;

  @ApiProperty({ description: '평점', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;
}
