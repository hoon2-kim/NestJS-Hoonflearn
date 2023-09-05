import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  ValidateNested,
} from 'class-validator';
import { ECourseLevelType } from '../../enums/course.enum';

export class CreateCourseDto {
  @ApiProperty({
    description: '강의 제목',
    example: '스프링 핵심 원리 - 기본편',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: ['스프링 기본 기능', '스프링 핵심 원리', '객체 지향 설계'],
    description: '강의에서 이런 걸 배워요 / 최소 2개 이상 적어주세요',
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  @ArrayMinSize(2)
  @IsNotEmpty()
  learnable: string[];

  @ApiProperty({
    example: [
      '스프링을 처음 접하는 개발자',
      '스프링의 핵심 원리를 이해하고픈 개발자',
    ],
    description: '이런 분들 께 추천드려요 / 최소 2개 이상 적어주세요',
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  @ArrayMinSize(2)
  @IsNotEmpty()
  recommendedFor: string[];

  @ApiPropertyOptional({
    example: ['자바언어'],
    description: '선수지식',
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  prerequisite?: string[];

  @ApiProperty({
    enum: ECourseLevelType,
    enumName: 'ECourseLevelType',
    description: '강의 수준',
    example: ECourseLevelType.Beginner,
  })
  @IsEnum(ECourseLevelType)
  @IsNotEmpty()
  level: ECourseLevelType;

  @ApiProperty({
    description: '강의 요약',
    example: '강의 두줄요약을 적어주세요.',
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({
    description: '상세소개',
    example: '강의 상세소개를 적어주세요.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      '강의 가격 / 무료 강의의 경우 0원 , 유료 강의의 경우 10000원 이상 부터 1000원 단위로',
    example: 88000,
  })
  @IsInt()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: [
      {
        parentCategoryId: '0c0645da-ed48-4723-b0a1-a444145f0982',
        subCategoryId: '8776688a-2744-4687-b664-006ef8b9861b',
      },
      {
        parentCategoryId: '0c0645da-ed48-4723-b0a1-a444145f0982',
        subCategoryId: 'a1e8875e-bf5c-4f06-beaa-9187e4537480',
      },
    ],
    description: '메인카테고리,서브카테고리 배열 / 최소 1개 , 최대 4개',
    isArray: true,
  })
  @IsArray()
  @ArrayMaxSize(4)
  @IsNotEmpty()
  @ValidateNested({ each: true }) // 배열 내의 각 내장 객체들도 검사
  @Type(() => CategoryIdsDto) // 변환
  selectedCategoryIds: CategoryIdsDto[];
}

export class CategoryIdsDto {
  @ApiProperty({
    example: '0c0645da-ed48-4723-b0a1-a444145f0982',
    description: '메인 카테고리 ID',
  })
  @IsUUID('4')
  parentCategoryId: string;

  @ApiProperty({
    example: '8776688a-2744-4687-b664-006ef8b9861b',
    description: '서브 카테고리 ID',
  })
  @IsUUID('4')
  subCategoryId: string;
}
