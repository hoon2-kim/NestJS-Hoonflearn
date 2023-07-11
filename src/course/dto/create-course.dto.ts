import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CourseLevelType } from '../entities/course.entity';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString({ each: true })
  @IsArray()
  @ArrayMinSize(2)
  @IsNotEmpty()
  learnable: string[];

  @IsString({ each: true })
  @IsArray()
  @ArrayMinSize(2)
  @IsNotEmpty()
  recommendedFor: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  prerequisite?: string[];

  @IsEnum(CourseLevelType)
  @IsNotEmpty()
  level: CourseLevelType;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsUUID()
  @IsNotEmpty()
  parentCategoryId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(4)
  @IsNotEmpty()
  subCategoryIds: string[];
}
