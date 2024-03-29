import { ApiProperty, PickType } from '@nestjs/swagger';
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

  // @ApiProperty({ description: '핸드폰번호' })
  // @IsString()
  // @IsNotEmpty()
  // phone: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class NicknameDto extends PickType(CreateUserDto, [
  'nickname',
] as const) {}

export class PhoneDto {
  @ApiProperty({ description: '핸드폰번호' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class PhoneCheckDto extends PhoneDto {
  @ApiProperty({ description: '인증번호' })
  @IsNotEmpty()
  token: string;
}
