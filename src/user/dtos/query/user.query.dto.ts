import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionDto } from 'src/common/dtos/page-option.dto';
import { EQuestionStatus } from 'src/question/enums/question.enum';
import { ECourseChargeType } from 'src/course/enums/course.enum';
import { EUserWishCourseSort } from 'src/user/enums/user.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserWishQueryDto extends PageOptionDto {
  @ApiPropertyOptional({
    enum: ECourseChargeType,
    enumName: 'ECourseChargeType',
    description: '무료/유료 필터링',
  })
  @IsOptional()
  @IsEnum(ECourseChargeType)
  charge: ECourseChargeType;

  @ApiPropertyOptional({
    enum: EUserWishCourseSort,
    enumName: 'EUserWishCourseSort',
    description: '최신순/제목순/평점순/학생순 정렬',
  })
  @IsOptional()
  @IsEnum(EUserWishCourseSort)
  sort: EUserWishCourseSort;

  @ApiPropertyOptional({
    description: '페이지당 아이템 수',
    type: 'number',
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  take?: number = 20;
}

export class UserQuestionQueryDto extends PageOptionDto {
  @ApiPropertyOptional({
    enum: EQuestionStatus,
    enumName: 'EQuestionStatus',
    description: '해결/미해결 필터링',
  })
  @IsOptional()
  @IsEnum(EQuestionStatus)
  status: EQuestionStatus;

  @ApiPropertyOptional({
    description: '페이지당 아이템 수',
    type: 'number',
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  take?: number = 20;
}

export class UserMyCourseQueryDto extends PageOptionDto {
  @ApiPropertyOptional({ description: '검색어' })
  @IsOptional()
  @IsString()
  s: string;

  @ApiPropertyOptional({
    description: '페이지당 아이템 수',
    type: 'number',
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  take?: number = 20;
}
