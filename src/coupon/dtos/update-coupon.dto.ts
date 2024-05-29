import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateCouponDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
