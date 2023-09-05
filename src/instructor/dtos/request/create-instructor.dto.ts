import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { EFieldOfHopeType } from 'src/instructor/enums/instructor.enum';

export class CreateInstructorDto {
  @ApiProperty({
    description: '연락받을 이메일',
    example: 'gooaba1204@gmail.com',
  })
  @IsEmail({}, { message: '올바른 이메일을 입력해주세요.' })
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({
    description: '지식공유자 실명 또는 사업체명',
    example: '김상훈',
  })
  @IsString()
  @IsNotEmpty()
  nameOrBusiness: string;

  @ApiProperty({
    enum: EFieldOfHopeType,
    enumName: 'EFieldOfHopeType',
    description: '희망하는 분야',
    example: EFieldOfHopeType.DevProgram,
  })
  @IsEnum(EFieldOfHopeType)
  @IsNotEmpty()
  fieldOfHope: EFieldOfHopeType;

  @ApiProperty({
    description: '나를 소개하는 글',
    example: '나를 소개하는 글을 적어주세요',
  })
  @IsString()
  @IsNotEmpty()
  aboutMe: string;

  @ApiPropertyOptional({
    description: '나를 표현할 수 있는 링크',
    example: '나를 표현할 수 있는 링크가 있다면 적어주세요',
  })
  @IsUrl()
  @IsOptional()
  link?: string;
}
