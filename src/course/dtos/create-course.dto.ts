import { Type } from 'class-transformer';
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
  ValidateNested,
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

  @IsArray()
  @ArrayMaxSize(4)
  @IsNotEmpty()
  @ValidateNested({ each: true }) // 배열 내의 각 내장 객체들도 검사
  @Type(() => CategoryIdsDto) // 변환
  selectedCategoryIds: CategoryIdsDto[];
}

export class CategoryIdsDto {
  @IsUUID('4')
  parentCategoryId: string;

  @IsUUID('4')
  subCategoryId: string;
}
