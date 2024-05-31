import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponUserModule } from '@src/coupon_user/coupon-user.module';
import { CouponUserEntity } from '@src/coupon_user/entities/coupon-user.entity';
import { CourseModule } from '@src/course/course.module';
import { CustomRedisModule } from '@src/redis/redis.module';
import { BULL_REGISTER_QUEUE_NAME } from './constants';
import { CouponConsumer } from './coupon.consumer';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponEntity } from './entities/coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CouponEntity, CouponUserEntity]),
    CourseModule,
    CustomRedisModule,
    CouponUserModule,
    BullModule.registerQueue({
      name: BULL_REGISTER_QUEUE_NAME,
    }),
  ],
  controllers: [CouponController],
  providers: [CouponService, CouponConsumer],
})
export class CouponModule {}
