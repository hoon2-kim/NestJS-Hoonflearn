import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Validate,
} from 'class-validator';
import { ECouponType } from '../entities/coupon.entity';
import {
  CouponPriceValidator,
  CouponTypeValidator,
} from '../validators/coupon.validator';

export class CreateCouponDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  @Validate(CouponPriceValidator)
  discountPrice: number;

  @IsEnum(ECouponType)
  @IsNotEmpty()
  @Validate(CouponTypeValidator)
  couponType: ECouponType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalQuantity: number;

  @IsDateString()
  @IsOptional()
  endAt: string;

  @IsUUID('4')
  @IsNotEmpty()
  courseId: string;
}
