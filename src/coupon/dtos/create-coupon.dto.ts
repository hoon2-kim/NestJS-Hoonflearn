import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: '할인 가격(최소 1000원 이상)',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  @Validate(CouponPriceValidator)
  discountPrice: number;

  @ApiProperty({
    enum: ECouponType,
    enumName: 'ECouponType',
    description: '쿠폰 종류(무제한,제한)',
    example: ECouponType.LIMIT,
  })
  @IsEnum(ECouponType)
  @IsNotEmpty()
  @Validate(CouponTypeValidator)
  couponType: ECouponType;

  @ApiProperty({
    description: '쿠폰 종류가 제한 인 경우 수량',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalQuantity: number;

  @ApiProperty({
    description: '쿠폰 만료일',
  })
  @IsDateString()
  @IsOptional()
  endAt: string;

  @ApiProperty({
    description: '강의 ID',
  })
  @IsUUID('4')
  @IsNotEmpty()
  courseId: string;
}
