import { getQueueToken } from '@nestjs/bull';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CouponService } from '@src/coupon/coupon.service';
import { CouponUserEntity } from '@src/coupon_user/entities/coupon-user.entity';
import { CourseService } from '@src/course/course.service';
import { CourseEntity } from '@src/course/entities/course.entity';
import { CustomRedisService } from '@src/redis/redis.service';
import {
  mockCoupon,
  mockCouponUser,
  mockCreateCouponDto,
  mockHashCoupon,
  mockPaidCourse,
  mockRegisterCouponDto,
} from '@test/__mocks__/mock-data';
import {
  mockCouponRepository,
  mockCouponUserRepository,
} from '@test/__mocks__/mock-repository';
import {
  mockCourseService,
  mockRedisService,
} from '@test/__mocks__/mock-service';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import {
  BULL_REGISTER_QUEUE_NAME,
  REDIS_COUPON_HASH_KEY,
  REDIS_COUPON_SET_KEY,
} from '../constants';
import { CouponEntity, ECouponType } from '../entities/coupon.entity';

export const mockBullQueue: Partial<Queue> = {
  add: jest.fn(),
};

jest.mock('../../common/utils/date-fns.ts');

describe('CartService', () => {
  let couponService: CouponService;
  let couponRepository: Repository<CouponEntity>;
  let couponUserRepository: Repository<CouponUserEntity>;
  let courseService: CourseService;
  let redisService: CustomRedisService;
  let couponQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: getRepositoryToken(CouponEntity),
          useValue: mockCouponRepository,
        },
        {
          provide: getRepositoryToken(CouponUserEntity),
          useValue: mockCouponUserRepository,
        },
        { provide: CourseService, useValue: mockCourseService },
        { provide: CustomRedisService, useValue: mockRedisService },
        {
          provide: getQueueToken(BULL_REGISTER_QUEUE_NAME),
          useValue: mockBullQueue,
        },
      ],
    }).compile();

    couponService = module.get<CouponService>(CouponService);
    couponRepository = module.get<Repository<CouponEntity>>(
      getRepositoryToken(CouponEntity),
    );
    couponUserRepository = module.get<Repository<CouponUserEntity>>(
      getRepositoryToken(CouponUserEntity),
    );
    courseService = module.get<CourseService>(CourseService);
    redisService = module.get<CustomRedisService>(CustomRedisService);
    couponQueue = module.get<Queue>(getQueueToken(BULL_REGISTER_QUEUE_NAME));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(couponService).toBeDefined();
    expect(couponRepository).toBeDefined();
    expect(courseService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  describe('[지식공유자의 강의 쿠폰 생성]', () => {
    const mockCourse = {
      id: 'uuid',
      fk_instructor_id: 'uuid',
      price: 10000,
    } as CourseEntity;
    const userId = 'uuid';

    it('쿠폰 생성 성공', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCourse);
      jest.spyOn(couponRepository, 'save').mockResolvedValue(mockCoupon);
      jest.spyOn(redisService, 'hSet').mockResolvedValue(1);

      const result = await couponService.createCoupon(
        mockCreateCouponDto,
        userId,
      );

      expect(result).toEqual(mockCoupon);
      expect(redisService.hSet).toBeCalled();
    });

    it('쿠폰 생성 실패 - 강의가 존재하지 않는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValueOnce(null);

      try {
        await couponService.createCoupon(mockCreateCouponDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('쿠폰 생성 실패 - 무료강의에 쿠폰을 생성하려는 경우(400에러)', async () => {
      const mockFreeCourse = {
        ...mockCourse,
        price: 0,
      };

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValueOnce(mockFreeCourse);

      try {
        await couponService.createCoupon(mockCreateCouponDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('쿠폰 생성 실패 - 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCourse);

      try {
        await couponService.createCoupon(mockCreateCouponDto, 'invalidUserId');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

    it('쿠폰 생성 실패 - 쿠폰 할인금액이 강의 가격을 초과한 경우(400에러)', async () => {
      const mockPriceCourse = {
        ...mockCourse,
        price: 5000,
      };

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockPriceCourse);

      try {
        await couponService.createCoupon(mockCreateCouponDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[유저의 쿠폰 등록]', () => {
    const userId = 'uuid';

    it('등록 성공(선착순 쿠폰)', async () => {
      jest.spyOn(redisService, 'hGetAll').mockResolvedValue(mockHashCoupon);
      jest.spyOn(redisService, 'sIsMember').mockResolvedValueOnce(0);
      jest.spyOn(redisService, 'luaExcute').mockResolvedValueOnce(1);

      await couponService.registerCoupon(mockRegisterCouponDto, userId);

      expect(redisService.hGetAll).toHaveBeenCalledWith(
        REDIS_COUPON_HASH_KEY(mockRegisterCouponDto.code),
      );
      expect(redisService.sIsMember).toHaveBeenCalledWith(
        REDIS_COUPON_SET_KEY(mockHashCoupon.couponId),
        userId,
      );
      expect(redisService.luaExcute).toHaveBeenCalledWith(
        expect.any(String),
        [REDIS_COUPON_SET_KEY(mockHashCoupon.couponId)],
        [userId, mockHashCoupon.totalQuantity],
      );
      expect(couponQueue.add).toHaveBeenCalled();
    });

    it('등록 성공(무제한 쿠폰)', async () => {
      const mockHashInfiCoupon = {
        ...mockHashCoupon,
        couponType: ECouponType.INFINITY,
      };

      jest.spyOn(redisService, 'hGetAll').mockResolvedValue(mockHashInfiCoupon);
      jest.spyOn(couponUserRepository, 'findOne').mockResolvedValueOnce(null);

      await couponService.registerCoupon(mockRegisterCouponDto, userId);

      expect(redisService.hGetAll).toHaveBeenCalledWith(
        REDIS_COUPON_HASH_KEY(mockRegisterCouponDto.code),
      );
      expect(redisService.sIsMember).toBeCalledTimes(0);
      expect(redisService.luaExcute).toBeCalledTimes(0);
      expect(couponQueue.add).toHaveBeenCalled();
    });

    // it('선착순 쿠폰 동시성 제어 테스트', async () => {
    //   jest.spyOn(redisService, 'hGetAll').mockResolvedValue(mockHashCoupon);
    //   jest.spyOn(redisService, 'sIsMember').mockResolvedValue(0);

    //   let luaCalled = 0;
    //   jest.spyOn(redisService, 'luaExcute').mockImplementation(() => {
    //     luaCalled++;
    //     return Promise.resolve(luaCalled <= 3 ? 1 : -1);
    //   });

    //   const results = await Promise.allSettled([
    //     await couponService.registerCoupon(mockRegisterCouponDto, 'uuid1'),
    //     await couponService.registerCoupon(mockRegisterCouponDto, 'uuid2'),
    //     await couponService.registerCoupon(mockRegisterCouponDto, 'uuid3'),
    //     await couponService.registerCoupon(mockRegisterCouponDto, 'uuid4'),
    //     await couponService.registerCoupon(mockRegisterCouponDto, 'uuid5'),
    //   ]);

    //   expect(redisService.hGetAll).toHaveBeenCalledWith(
    //     REDIS_COUPON_HASH_KEY(mockRegisterCouponDto.code),
    //   );
    //   expect(redisService.sIsMember).toBeCalledTimes(5);
    //   expect(redisService.luaExcute).toBeCalledTimes(5);
    //   expect(couponQueue.add).toBeCalledTimes(3);
    // });
  });
});
