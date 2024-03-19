import { Test, TestingModule } from '@nestjs/testing';
import { CartCourseService } from '@src/cart_course/cart_course.service';
import { EntityManager, Repository } from 'typeorm';
import { CartCourseEntity } from '@src/cart_course/entities/cart-course.entity';
import { CourseService } from '@src/course/course.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockCartCourseRepository } from '@test/__mocks__/mock-repository';
import { mockCourseService } from '@test/__mocks__/mock-service';
import {
  mockCart,
  mockCartCourse,
  mockPaidCourse,
} from '@test/__mocks__/mock-data';

describe('CartCourseService', () => {
  let cartCourseService: CartCourseService;
  let cartCourseRepository: Repository<CartCourseEntity>;
  let courseService: CourseService;

  const mockEntityManager = {
    delete: jest.fn(),
    findOne: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartCourseService,
        {
          provide: getRepositoryToken(CartCourseEntity),
          useValue: mockCartCourseRepository,
        },
        { provide: CourseService, useValue: mockCourseService },
      ],
    }).compile();

    cartCourseService = module.get<CartCourseService>(CartCourseService);
    cartCourseRepository = module.get<Repository<CartCourseEntity>>(
      getRepositoryToken(CartCourseEntity),
    );
    courseService = module.get<CourseService>(CourseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cartCourseService).toBeDefined();
    expect(cartCourseRepository).toBeDefined();
    expect(courseService).toBeDefined();
  });

  describe('insertCourseInCart 테스트 - 장바구니에 담은 강의 중간엔티티에 저장', () => {
    it('성공', async () => {
      const courseId = 'uuid';

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockPaidCourse);
      jest.spyOn(cartCourseService, 'findOneByOptions').mockResolvedValue(null);
      jest
        .spyOn(cartCourseRepository, 'save')
        .mockResolvedValue(mockCartCourse);

      const result = await cartCourseService.insertCourseInCart(
        courseId,
        mockCart,
      );

      expect(result).toEqual(mockCartCourse);
      expect(courseService.findOneByOptions).toBeCalledTimes(1);
      expect(cartCourseService.findOneByOptions).toBeCalledTimes(1);
      expect(cartCourseRepository.save).toBeCalledTimes(1);
    });

    it('실패 - 해당 강의가 없는 경우(404에러)', async () => {
      const courseId = 'uuid';

      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await cartCourseService.insertCourseInCart(courseId, mockCart);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('실패 - 이미 장바구니에 넣은 경우(400에러)', async () => {
      const courseId = 'uuid';

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockPaidCourse);
      jest
        .spyOn(cartCourseService, 'findOneByOptions')
        .mockResolvedValue(mockCartCourse);

      try {
        await cartCourseService.insertCourseInCart(courseId, mockCart);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('deleteCourseInCart 테스트 - 장바구니에 담은 강의 삭제 로직', () => {
    it('삭제 성공 - EntityManger없이', async () => {
      const courseId = 'uuid';
      const cartId = 'uuid';

      jest
        .spyOn(cartCourseService, 'findCourseInCart')
        .mockResolvedValue(mockCartCourse);
      jest
        .spyOn(cartCourseRepository, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await cartCourseService.deleteCourseInCart(
        cartId,
        courseId,
      );

      expect(result).toEqual({ raw: [], affected: 1 });
      expect(cartCourseRepository.delete).toBeCalledWith({
        fk_cart_id: cartId,
        fk_course_id: courseId,
      });
    });

    it('삭제 성공 - EntityManger', async () => {
      const courseId = 'uuid';
      const cartId = 'uuid';

      jest
        .spyOn(cartCourseService, 'findCourseInCart')
        .mockResolvedValue(mockCartCourse);
      jest
        .spyOn(mockEntityManager, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await cartCourseService.deleteCourseInCart(
        cartId,
        courseId,
        mockEntityManager,
      );

      expect(result).toEqual({ raw: [], affected: 1 });
      expect(mockEntityManager.delete).toBeCalledWith(CartCourseEntity, {
        fk_cart_id: cartId,
        fk_course_id: courseId,
      });
    });

    it('삭제 실패 - 장바구니에 삭제하려는 강의가 없는 경우(404에러)', async () => {
      const courseId = 'uuid';
      const cartId = 'uuid';

      jest.spyOn(cartCourseService, 'findCourseInCart').mockResolvedValue(null);

      try {
        await cartCourseService.deleteCourseInCart(cartId, courseId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('findCourseInCart 테스트 - 장바구니ID와 강의ID로 장바구니에 들어있는지 확인하는 로직', () => {
    it('조회 성공 - EntityManger없이', async () => {
      const courseId = 'uuid';
      const cartId = 'uuid';

      jest
        .spyOn(cartCourseService, 'findOneByOptions')
        .mockResolvedValue(mockCartCourse);

      const result = await cartCourseService.findCourseInCart(cartId, courseId);

      expect(result).toEqual(mockCartCourse);
      expect(cartCourseService.findOneByOptions).toBeCalledWith({
        where: {
          fk_cart_id: cartId,
          fk_course_id: courseId,
        },
      });
    });

    it('조회 성공 - EntityManger', async () => {
      const courseId = 'uuid';
      const cartId = 'uuid';

      jest
        .spyOn(mockEntityManager, 'findOne')
        .mockResolvedValue(mockCartCourse);

      const result = await cartCourseService.findCourseInCart(
        cartId,
        courseId,
        mockEntityManager,
      );

      expect(result).toEqual(mockCartCourse);
      expect(mockEntityManager.findOne).toBeCalledWith(CartCourseEntity, {
        where: {
          fk_cart_id: cartId,
          fk_course_id: courseId,
        },
      });
    });
  });
});
