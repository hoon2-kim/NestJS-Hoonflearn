import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({
    example: 'b0d2623e-ab86-4112-85f5-5c5edd179c20',
    description: '강의 ID',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '섹션 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: '섹션 목표',
  })
  @IsString()
  @IsOptional()
  goal?: string;
}
