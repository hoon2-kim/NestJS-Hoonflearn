import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponUserService } from './coupon-user.service';
import { CouponUserEntity } from './entities/coupon-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponUserEntity])],
  providers: [CouponUserService],
  exports: [CouponUserService],
})
export class CouponUserModule {}
