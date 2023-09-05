import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({ description: '강의 ID(무료)' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
