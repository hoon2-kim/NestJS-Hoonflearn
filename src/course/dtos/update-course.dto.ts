import { PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CourseLevelType } from '../entities/course.entity';
import { CategoryIdsDto, CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsOptional()
  title?: string;

  @IsOptional()
  learnable?: string[];

  @IsOptional()
  recommendedFor?: string[];

  @IsOptional()
  prerequisite?: string[];

  @IsOptional()
  level?: CourseLevelType;

  @IsOptional()
  summary?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  selectedCategoryIds?: CategoryIdsDto[];
}
