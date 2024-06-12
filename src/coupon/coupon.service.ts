import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareCouponEndAt } from '@src/common/utils/date-fns';
import { createRandomToken } from '@src/common/utils/randomToken';
import { CouponUserEntity } from '@src/coupon_user/entities/coupon-user.entity';
import { CourseService } from '@src/course/course.service';
import { CustomRedisService } from '@src/redis/redis.service';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import {
  BULL_QUEUE_ADD_NAME,
  BULL_REGISTER_QUEUE_NAME,
  REDIS_COUPON_HASH_KEY,
  REDIS_COUPON_SET_KEY,
} from './constants';
import { CreateCouponDto } from './dtos/create-coupon.dto';
import { RegisterCouponDto } from './dtos/register-coupon.dto';
import { UpdateCouponDto } from './dtos/update-coupon.dto';
import { CouponEntity, ECouponType } from './entities/coupon.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,

    @InjectRepository(CouponUserEntity)
    private readonly couponUserRepository: Repository<CouponUserEntity>,

    private readonly courseService: CourseService,
    private readonly redisService: CustomRedisService,

    @InjectQueue(BULL_REGISTER_QUEUE_NAME)
    private readonly couponQueue: Queue,
  ) {}

  async createCoupon(createCouponDto: CreateCouponDto, userId: string) {
    const { courseId, couponType, discountPrice, endAt, totalQuantity } =
      createCouponDto;

    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
      select: {
        id: true,
        fk_instructor_id: true,
        price: true,
      },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    if (course.price === 0) {
      throw new BadRequestException('무료강의는 쿠폰을 발급할 수 없습니다.');
    }

    if (course.fk_instructor_id !== userId) {
      throw new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.');
    }

    if (course.price < discountPrice) {
      throw new BadRequestException('할인금액이 강의 가격을 넘을 수 없습니다.');
    }

    const result = await this.couponRepository.save({
      couponType,
      discountPrice,
      endAt: new Date(endAt),
      totalQuantity,
      code: createRandomToken(10),
      course: { id: courseId },
      instructor: { id: userId },
    });

    await this.redisService.hSet(REDIS_COUPON_HASH_KEY(result.code), {
      couponId: result.id,
      couponType,
      discountPrice,
      totalQuantity,
      endAt: result.endAt ? result.endAt : null,
      courseId,
    });

    return result;
  }

  async registerCoupon(registerCouponDto: RegisterCouponDto, userId: string) {
    const { code } = registerCouponDto;

    const coupon = await this.redisService.hGetAll(REDIS_COUPON_HASH_KEY(code));

    if (Object.keys(coupon).length === 0) {
      throw new NotFoundException('해당 쿠폰이 존재하지 않습니다.');
    }

    if (compareCouponEndAt(coupon.endAt) === 1) {
      throw new BadRequestException('해당 쿠폰은 만료되었습니다.');
    }

    if (coupon.couponType === ECouponType.INFINITY) {
      const duplicateInfiCouponUser = await this.couponUserRepository.findOne({
        where: {
          fk_user_id: userId,
          fk_coupon_id: coupon.couponId,
        },
      });

      if (duplicateInfiCouponUser) {
        throw new BadRequestException('이미 쿠폰을 등록하셨습니다.');
      }
    }

    if (coupon.couponType === ECouponType.LIMIT) {
      const duplicateLimitCouponUser = await this.redisService.sIsMember(
        REDIS_COUPON_SET_KEY(coupon.couponId),
        userId,
      );

      if (duplicateLimitCouponUser) {
        throw new BadRequestException('이미 쿠폰을 등록하셨습니다.');
      }

      const luaScript = `
    local couponSetKey = KEYS[1]
    local userId = ARGV[1]
    local totalQuantity = tonumber(ARGV[2])

    local currentCount = redis.call('SCARD', couponSetKey)
    if currentCount >= totalQuantity then
      return -1
    end

    redis.call('SADD', couponSetKey, userId)
    return 1
    `;

      const keys = [REDIS_COUPON_SET_KEY(coupon.couponId)];
      const args = [userId, coupon.totalQuantity];

      const luaResult = await this.redisService.luaExcute(
        luaScript,
        keys,
        args,
      );

      if (luaResult === -1) {
        throw new BadRequestException('쿠폰이 소진되었습니다.');
      }
    }
    await this.couponQueue.add(
      BULL_QUEUE_ADD_NAME,
      {
        couponId: coupon.couponId,
        userId,
      },
      { removeOnComplete: true, removeOnFail: true },
    );
  }

  async updateCouponStatus(
    id: string,
    updateCouponDto: UpdateCouponDto,
    userId: string,
  ) {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: {
        instructor: true,
      },
    });

    if (!coupon) {
      throw new NotFoundException('해당 쿠폰이 존재하지 않습니다.');
    }

    if (coupon.instructor.id !== userId) {
      throw new ForbiddenException('해당 쿠폰을 만든 지식공유자가 아닙니다.');
    }

    Object.assign(coupon, updateCouponDto);

    return await this.couponRepository.save(coupon);
  }
}
