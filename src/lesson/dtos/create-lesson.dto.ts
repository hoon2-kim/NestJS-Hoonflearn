import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    example: '90388e3c-c641-4a65-a381-d969e4a080b5',
    description: '섹션 ID',
  })
  @IsUUID()
  @IsNotEmpty()
  sectionId: string;

  @ApiProperty({ description: '수업 제목', example: '스프링이란?' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: '수업 노트',
    example: '수업에 관한 정보......',
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({
    description: '수업 무료 공개 여부',
    default: false,
    type: 'boolean',
  })
  @IsBoolean()
  @IsOptional()
  isFreePublic?: boolean;
}
