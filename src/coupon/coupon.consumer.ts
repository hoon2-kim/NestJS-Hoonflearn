import { Process, Processor } from '@nestjs/bull';
import { CouponUserService } from '@src/coupon_user/coupon-user.service';
import { Job } from 'bull';
import { BULL_QUEUE_ADD_NAME, BULL_REGISTER_QUEUE_NAME } from './constants';

@Processor(BULL_REGISTER_QUEUE_NAME)
export class CouponConsumer {
  constructor(private readonly couponUserService: CouponUserService) {}

  @Process(BULL_QUEUE_ADD_NAME)
  async jobSaveDbCouponData(job: Job) {
    const { couponId, userId } = job.data;

    await this.couponUserService.saveCouponUserData(couponId, userId);
  }
}
