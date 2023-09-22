import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import {
  CategoryIdsDto,
  CreateCourseDto,
} from '@src/course/dtos/request/create-course.dto';

export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['price'] as const),
) {
  @IsOptional()
  title?: string;

  @IsOptional()
  learnable?: string[];

  @IsOptional()
  recommendedFor?: string[];

  @IsOptional()
  prerequisite?: string[];

  @IsOptional()
  level?: ECourseLevelType;

  @IsOptional()
  summary?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  selectedCategoryIds?: CategoryIdsDto[];
}
