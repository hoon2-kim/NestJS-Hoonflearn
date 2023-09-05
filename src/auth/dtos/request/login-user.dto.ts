import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: '로그인 이메일' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '로그인 비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
