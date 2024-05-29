import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
