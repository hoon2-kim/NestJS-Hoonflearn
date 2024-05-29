import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateCouponDto } from '../dtos/create-coupon.dto';
import { ECouponType } from '../entities/coupon.entity';

@ValidatorConstraint({
  name: 'couponTypeValidator',
  async: false,
})
@Injectable()
export class CouponTypeValidator implements ValidatorConstraintInterface {
  validate(value: ECouponType, args: ValidationArguments): boolean {
    const dto = args.object as CreateCouponDto;

    if (value === ECouponType.INFINTY) {
      return dto.totalQuantity ? false : true;
    }

    if (value === ECouponType.LIMIT) {
      return dto.totalQuantity ? true : false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    if (args.value === ECouponType.INFINTY) {
      return '쿠폰타입이 무제한인 경우 수량을 입력하지 말아주세요.';
    }

    if (args.value === ECouponType.LIMIT) {
      return '쿠폰타입이 제한인 경우 수량을 입력해주세요';
    }
  }
}

@ValidatorConstraint({ name: 'couponPriceValidator', async: false })
@Injectable()
export class CouponPriceValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: number, _args: ValidationArguments) {
    if (value % 1000 !== 0) {
      return false;
    }

    return true;
  }

  defaultMessage(_args: ValidationArguments): string {
    return '할인금액 단위는 1000원 단위입니다.';
  }
}
