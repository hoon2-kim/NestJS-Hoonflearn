import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    description: '장바구니에 담을 강의의 ID',
    example: 'b0d2623e-ab86-4112-85f5-5c5edd179c20',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
