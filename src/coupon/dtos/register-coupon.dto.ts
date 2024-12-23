import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterCouponDto {
  @ApiProperty({
    description: '쿠폰 코드',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
