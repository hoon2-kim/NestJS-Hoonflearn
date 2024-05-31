import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponUserEntity } from './entities/coupon-user.entity';

@Injectable()
export class CouponUserService {
  constructor(
    @InjectRepository(CouponUserEntity)
    private readonly couponUserRepository: Repository<CouponUserEntity>,
  ) {}

  async saveCouponUserData(couponId: string, userId: string) {
    return await this.couponUserRepository.save({
      fk_user_id: userId,
      fk_coupon_id: couponId,
    });
  }
}
