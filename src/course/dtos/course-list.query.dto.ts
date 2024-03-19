import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionDto } from '@src/common/dtos/page-option.dto';
import {
  ECourseChargeType,
  ECourseLevelType,
  ECourseSortBy,
} from '@src/course/enums/course.enum';

export class CourseListQueryDto extends PageOptionDto {
  @ApiPropertyOptional({ description: '검색어' })
  @IsOptional()
  @IsString()
  s?: string;

  @ApiPropertyOptional({
    description: '강의 수준으로 필터링',
    enum: ECourseLevelType,
    enumName: 'ECourseLevelType',
  })
  @IsOptional()
  @IsEnum(ECourseLevelType)
  level?: ECourseLevelType;

  @ApiPropertyOptional({
    description: '찜한순/학생수/평점순/최신순/오래된순 정렬',
    enum: ECourseSortBy,
    enumName: 'ECourseSortBy',
  })
  @IsOptional()
  @IsEnum(ECourseSortBy)
  sort?: ECourseSortBy;

  @ApiPropertyOptional({
    description: '무료/유료 필터링',
    enum: ECourseChargeType,
    enumName: 'ECourseChargeType',
  })
  @IsOptional()
  @IsEnum(ECourseChargeType)
  charge?: ECourseChargeType;

  @ApiPropertyOptional({
    description: '페이지당 아이템 수',
    type: 'number',
    default: 24,
    minimum: 1,
    maximum: 50,
  })
  take?: number = 24;
}
