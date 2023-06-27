import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'gooaba1204@gmail.com', description: '이메일' })
  @IsEmail({}, { message: '올바른 이메일을 작성해주세요.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '훈이', description: '닉네임' })
  @IsString()
  @MinLength(2)
  @MaxLength(18)
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ example: '01012341234', description: '핸드폰번호' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '1234', description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
