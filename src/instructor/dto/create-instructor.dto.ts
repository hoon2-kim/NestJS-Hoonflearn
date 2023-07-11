import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { FieldOfHopeType } from '../entities/instructor-profile.entity';

export class CreateInstructorDto {
  @IsEmail({}, { message: '올바른 이메일을 입력해주세요.' })
  @IsNotEmpty()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  nameOrBusiness: string;

  @IsEnum(FieldOfHopeType)
  @IsNotEmpty()
  fieldOfHope: FieldOfHopeType;

  @IsString()
  @IsNotEmpty()
  aboutMe: string;

  @IsUrl()
  @IsOptional()
  link?: string;
}
