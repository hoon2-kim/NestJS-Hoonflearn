import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '이메일' })
  @IsEmail({}, { message: '올바른 이메일을 작성해주세요.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '닉네임' })
  @IsString()
  @MinLength(2)
  @MaxLength(18)
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ description: '핸드폰번호' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
