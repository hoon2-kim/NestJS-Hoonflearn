import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from '@src/cart/cart.service';
import { CartCourseService } from '@src/cart_course/cart_course.service';
import { CourseService } from '@src/course/course.service';
import { CourseUserService } from '@src/course_user/course-user.service';
import { EntityManager, Repository } from 'typeorm';
import { CartEntity } from '@src/cart/entities/cart.entity';
import {
  mockCart,
  expectedMyCart,
  mockCartCourseService,
  mockCartRepository,
  mockCourseService,
  mockCourseUserService,
  mockCreatedCart,
  mockCreateCartDto,
} from '@test/__mocks__/cart.mock';
import { mockCourse } from '@test/__mocks__/course.mock';
import { mockCartCourse } from '@test/__mocks__/cartCourse.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let cartService: CartService;
  let cartRepository: Repository<CartEntity>;
  let cartCourseService: CartCourseService;
  let courseService: CourseService;
  let courseUserService: CourseUserService;

  const userId = 'uuid';
  const courseId = 'uuid';
  const mockEntityManager = {
    findOne: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(CartEntity),
          useValue: mockCartRepository,
        },
        { provide: CartCourseService, useValue: mockCartCourseService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: CourseUserService, useValue: mockCourseUserService },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    cartRepository = module.get<Repository<CartEntity>>(
      getRepositoryToken(CartEntity),
    );
    cartCourseService = module.get<CartCourseService>(CartCourseService);
    courseService = module.get<CourseService>(CourseService);
    courseUserService = module.get<CourseUserService>(CourseUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cartService).toBeDefined();
    expect(cartRepository).toBeDefined();
    expect(cartCourseService).toBeDefined();
    expect(courseService).toBeDefined();
    expect(courseUserService).toBeDefined();
  });

  describe('[내 장바구니 조회]', () => {
    it('조회 성공', async () => {
      jest
        .spyOn(cartRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(mockCart);
      jest
        .spyOn(courseService, 'calculateCoursePriceInCart')
        .mockResolvedValue(10000);

      const result = await cartService.findMyCart(userId);

      expect(result).toEqual(expectedMyCart);
      expect(
        cartRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(3);
      expect(cartRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(cartRepository.createQueryBuilder().getOne).toBeCalledTimes(1);
    });

    it('장바구니가 없다면 생성해주는지 호출 확인', async () => {
      jest
        .spyOn(cartRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(null);

      jest.spyOn(cartService, 'createCart').mockResolvedValue(mockCreatedCart);

      await cartService.findMyCart(userId);

      expect(cartService.createCart).toBeCalled();
    });
  });

  describe('createCart 테스트 - 장바구니 초기 생성', () => {
    it('생성 성공', async () => {
      jest.spyOn(cartRepository, 'save').mockResolvedValue(mockCreatedCart);

      const result = await cartService.createCart(userId);

      expect(result).toEqual(mockCreatedCart);
    });
  });

  describe('[장바구니에 강의 담기]', () => {
    it('강의 담기 성공', async () => {
      jest
        .spyOn(cartService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCart);
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCourse);
      jest
        .spyOn(courseUserService, 'checkBoughtCourseByUser')
        .mockResolvedValue(false);
      jest
        .spyOn(cartCourseService, 'insertCourseInCart')
        .mockResolvedValue(mockCartCourse);

      const result = await cartService.create(mockCreateCartDto, userId);

      expect(result).toEqual(mockCreatedCart);
      expect(courseService.findOneByOptions).toBeCalledTimes(1);
      expect(courseUserService.checkBoughtCourseByUser).toBeCalledTimes(1);
      expect(cartCourseService.insertCourseInCart).toBeCalledTimes(1);
    });

    it('초기 장바구니가 없다면 생성 호출 확인', async () => {
      jest.spyOn(cartService, 'findOneByOptions').mockResolvedValue(null);
      jest.spyOn(cartService, 'createCart').mockResolvedValue(mockCreatedCart);

      await cartService.create(mockCreateCartDto, userId);

      expect(cartService.createCart).toBeCalled();
    });

    it('강의 담기 실패 - 무료 강의를 담는 경우(400에러)', async () => {
      const mockFreeCourse = { ...mockCourse, price: 0 };
      jest
        .spyOn(cartService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCart);
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockFreeCourse);

      try {
        await cartService.create(mockCreateCartDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('강의 담기 실패 - 이미 구매한 강의인 경우(400에러)', async () => {
      jest
        .spyOn(cartService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCart);
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCourse);
      jest
        .spyOn(courseUserService, 'checkBoughtCourseByUser')
        .mockResolvedValue(true);

      try {
        await cartService.create(mockCreateCartDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[장바구니에 담은 강의 삭제]', () => {
    it('삭제 성공', async () => {
      jest
        .spyOn(cartService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCart);
      jest
        .spyOn(cartCourseService, 'deleteCourseInCart')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await cartService.delete(courseId, userId);

      expect(result).toBe(true);
      expect(cartCourseService.deleteCourseInCart).toBeCalledWith(
        mockCreatedCart.id,
        courseId,
      );
    });

    it('삭제 실패 - 장바구니가 없는 경우(404에러)', async () => {
      jest.spyOn(cartService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await cartService.delete(courseId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('clearCartWithTransaction 테스트 - 주문 완료 후 장바구니 비우기', () => {
    const courseIds = ['uuid1', 'uuid2'];

    it('비우기 성공', async () => {
      jest
        .spyOn(mockEntityManager, 'findOne')
        .mockResolvedValue(mockCreatedCart);
      jest
        .spyOn(cartCourseService, 'deleteCourseInCart')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await cartService.clearCartWithTransaction(
        userId,
        courseIds,
        mockEntityManager,
      );

      expect(result).toBeUndefined();
      for (const courseId of courseIds) {
        expect(cartCourseService.deleteCourseInCart).toBeCalledWith(
          mockCreatedCart.id,
          courseId,
          mockEntityManager,
        );
      }
    });

    it('비우기 실패 - 장바구니가 없는 경우(404에러)', async () => {
      jest.spyOn(mockEntityManager, 'findOne').mockResolvedValue(null);

      try {
        await cartService.clearCartWithTransaction(
          userId,
          courseIds,
          mockEntityManager,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('removeCart 테스트 - 회원탈퇴시 장바구니 제거', () => {
    it('제거 성공', async () => {
      jest
        .spyOn(cartRepository, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await cartService.removeCart(userId);

      expect(result).toBeUndefined();
    });
  });
});
