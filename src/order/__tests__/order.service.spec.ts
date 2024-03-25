import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from '@src/cart/cart.service';
import { CourseService } from '@src/course/course.service';
import { CourseEntity } from '@src/course/entities/course.entity';
import { CourseUserService } from '@src/course_user/course-user.service';
import { OrderService } from '@src/order/order.service';
import { OrderCourseService } from '@src/order_course/order-course.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { OrderListQueryDto } from '@src/order/dtos/order-list.query.dto';
import { OrderEntity } from '@src/order/entities/order.entity';
import { IamportService } from '@src/order/iamport.service';
import {
  mockOrderCourse,
  mockCreateOrderDto,
  mockOrder,
  mockPaidCourse,
  mockIamportData,
} from '@test/__mocks__/mock-data';
import { mockOrderRepository } from '@test/__mocks__/mock-repository';
import {
  mockIamportService,
  mockOrderCourseService,
  mockCartService,
  mockCourseUserService,
  mockCourseService,
} from '@test/__mocks__/mock-service';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';

const mockQueryRunner = {
  manager: {},
} as QueryRunner;

class MockDataSource {
  createQueryRunner(): QueryRunner {
    return mockQueryRunner;
  }
}

describe('OrderService', () => {
  let orderService: OrderService;
  let orderRepository: Repository<OrderEntity>;
  let dataSource: DataSource;
  let iamportService: IamportService;
  let orderCourseService: OrderCourseService;
  let cartService: CartService;
  let courseUserService: CourseUserService;
  let courseService: CourseService;

  const userId = 'uuid';
  const orderId = 'uuid';
  const courseIds = ['uuid1', 'uuid2'];

  beforeEach(async () => {
    Object.assign(mockQueryRunner.manager, {
      findOne: jest.fn(),
      save: jest.fn(),
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockReturnThis(),
        }),
      }),
    });
    mockQueryRunner.connect = jest.fn();
    mockQueryRunner.startTransaction = jest.fn();
    mockQueryRunner.commitTransaction = jest.fn();
    mockQueryRunner.rollbackTransaction = jest.fn();
    mockQueryRunner.release = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrderRepository,
        },
        { provide: DataSource, useClass: MockDataSource },
        { provide: IamportService, useValue: mockIamportService },
        { provide: OrderCourseService, useValue: mockOrderCourseService },
        { provide: CartService, useValue: mockCartService },
        { provide: CourseUserService, useValue: mockCourseUserService },
        { provide: CourseService, useValue: mockCourseService },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<OrderEntity>>(
      getRepositoryToken(OrderEntity),
    );
    dataSource = module.get<DataSource>(DataSource);
    iamportService = module.get<IamportService>(IamportService);
    orderCourseService = module.get<OrderCourseService>(OrderCourseService);
    cartService = module.get<CartService>(CartService);
    courseUserService = module.get<CourseUserService>(CourseUserService);
    courseService = module.get<CourseService>(CourseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderService).toBeDefined();
    expect(orderRepository).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(iamportService).toBeDefined();
    expect(orderCourseService).toBeDefined();
    expect(cartService).toBeDefined();
    expect(courseUserService).toBeDefined();
    expect(courseService).toBeDefined();
  });

  describe('[주문목록 조회]', () => {
    it('조회 성공', async () => {
      const query = new OrderListQueryDto();
      const { take, skip } = query;
      const mockOrders = [
        [
          {
            ...mockOrder,
          },
        ],
        1,
      ] as [OrderEntity[], number];
      const pageMeta = new PageMetaDto({
        pageOptionDto: query,
        itemCount: mockOrders[1],
      });
      const expectedMockOrders = new PageDto(mockOrders[0], pageMeta);

      jest.spyOn(orderRepository, 'findAndCount').mockResolvedValue(mockOrders);

      const result = await orderService.findOrders(query, userId);

      expect(result).toEqual(expectedMockOrders);
      expect(orderRepository.findAndCount).toBeCalledWith({
        where: { fk_user_id: userId },
        order: { created_at: 'DESC' },
        take,
        skip,
      });
    });
  });

  describe('[주문 상세 조회]', () => {
    it('조회 성공', async () => {
      const mockOrderDetail = {
        ...mockOrder,
        ordersCourses: [
          {
            ...mockOrderCourse,
            course: mockPaidCourse,
          },
        ],
      };

      jest
        .spyOn(orderRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(mockOrderDetail);

      const result = await orderService.findOrderDetail(orderId, userId);

      expect(result).toEqual(mockOrderDetail);
      expect(
        orderRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(2);
      expect(orderRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(orderRepository.createQueryBuilder().andWhere).toBeCalledTimes(1);
      expect(orderRepository.createQueryBuilder().getOne).toBeCalledTimes(1);
    });

    it('조회 실패 - 해당 주문기록이 없는 경우(404에러)', async () => {
      jest
        .spyOn(orderRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(null);

      try {
        await orderService.findOrderDetail(orderId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[주문 완료]', () => {
    let queryRunner: QueryRunner;

    beforeEach(() => {
      queryRunner = dataSource.createQueryRunner();
    });

    it('주문완료 성공', async () => {
      jest
        .spyOn(iamportService, 'getPaymentData')
        .mockResolvedValue(mockIamportData);
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(
          queryRunner.manager.getRepository(CourseEntity).createQueryBuilder(),
          'getMany',
        )
        .mockResolvedValue([mockPaidCourse, mockPaidCourse]);
      jest
        .spyOn(
          queryRunner.manager.getRepository(CourseEntity).createQueryBuilder(),
          'getRawOne',
        )
        .mockResolvedValue({
          total_price: String(mockPaidCourse.price + mockPaidCourse.price),
        });
      jest.spyOn(orderService, 'generateOrderName').mockResolvedValue('주문명');
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(mockOrder);
      jest
        .spyOn(orderCourseService, 'saveOrderCourseRepoWithTransaction')
        .mockResolvedValue([mockOrderCourse]);
      jest
        .spyOn(courseUserService, 'saveCourseUserRepo')
        .mockResolvedValue(undefined);
      jest
        .spyOn(courseService, 'updateCourseStudents')
        .mockResolvedValue(undefined);
      jest
        .spyOn(cartService, 'clearCartWithTransaction')
        .mockResolvedValue(undefined);

      const result = await orderService.create(mockCreateOrderDto, userId);

      expect(result).toEqual(mockOrder);
      expect(queryRunner.startTransaction).toBeCalledTimes(1);
      expect(queryRunner.commitTransaction).toBeCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toBeCalledTimes(0);
      expect(queryRunner.release).toBeCalledTimes(1);
      expect(queryRunner.manager.findOne).toBeCalledTimes(1);
      expect(
        queryRunner.manager.getRepository(CourseEntity).createQueryBuilder()
          .where,
      ).toBeCalledTimes(1);
      expect(
        queryRunner.manager.getRepository(CourseEntity).createQueryBuilder()
          .where,
      ).toBeCalledWith('course.id IN (:...ids)', { ids: courseIds });
      expect(
        queryRunner.manager.getRepository(CourseEntity).createQueryBuilder()
          .getMany,
      ).toBeCalledTimes(1);
      expect(
        queryRunner.manager.getRepository(CourseEntity).createQueryBuilder()
          .select,
      ).toBeCalledTimes(1);
      expect(
        queryRunner.manager.getRepository(CourseEntity).createQueryBuilder()
          .select,
      ).toBeCalledWith('SUM(course.price) as total_price');
      expect(
        queryRunner.manager.getRepository(CourseEntity).createQueryBuilder()
          .getRawOne,
      ).toBeCalledTimes(1);
      expect(queryRunner.manager.save).toBeCalledTimes(1);
      expect(
        orderCourseService.saveOrderCourseRepoWithTransaction,
      ).toBeCalledTimes(1);
      expect(courseUserService.saveCourseUserRepo).toBeCalledTimes(1);
      expect(courseService.updateCourseStudents).toBeCalledTimes(1);
      expect(cartService.clearCartWithTransaction).toBeCalledTimes(1);
    });

    it('주문완료 실패 - 이미 주문한 경우(409에러)', async () => {
      jest
        .spyOn(iamportService, 'getPaymentData')
        .mockResolvedValue(mockIamportData);
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(mockOrder);

      try {
        await orderService.create(mockCreateOrderDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('주문하려는 강의가 없거나 잘못된 경우(400에러)', async () => {
      jest
        .spyOn(iamportService, 'getPaymentData')
        .mockResolvedValue(mockIamportData);
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(
          queryRunner.manager.getRepository(CourseEntity).createQueryBuilder(),
          'getMany',
        )
        .mockResolvedValue([mockPaidCourse]);

      try {
        await orderService.create(mockCreateOrderDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('가격이 일치하지 않는 경우(400에러)', async () => {
      jest
        .spyOn(iamportService, 'getPaymentData')
        .mockResolvedValue(mockIamportData);
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(
          queryRunner.manager.getRepository(CourseEntity).createQueryBuilder(),
          'getMany',
        )
        .mockResolvedValue([mockPaidCourse, mockPaidCourse]);
      jest
        .spyOn(
          queryRunner.manager.getRepository(CourseEntity).createQueryBuilder(),
          'getRawOne',
        )
        .mockResolvedValue({ total_price: '100000000' });

      try {
        await orderService.create(mockCreateOrderDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });
  });
});
