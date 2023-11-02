import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderCourseService } from '@src/order_course/order-course.service';
import { mockCourse } from '@test/__mocks__/course.mock';
import { mockOrderCourse } from '@test/__mocks__/orderCourse.mock';
import { EntityManager, Repository } from 'typeorm';
import { OrderCourseEntity } from '@src/order_course/entities/order-course.entity';

describe('OrderCourseService', () => {
  let orderCourseService: OrderCourseService;
  let orderCourseRepository: Repository<OrderCourseEntity>;

  const mockEntityManager = {
    save: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderCourseService,
        { provide: getRepositoryToken(OrderCourseEntity), useValue: {} },
      ],
    }).compile();

    orderCourseService = module.get<OrderCourseService>(OrderCourseService);
    orderCourseRepository = module.get<Repository<OrderCourseEntity>>(
      getRepositoryToken(OrderCourseEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderCourseService).toBeDefined();
    expect(orderCourseRepository).toBeDefined();
  });

  describe('[주문한 강의들 중간테이블에 저장하는 로직 테스트]', () => {
    it('성공', async () => {
      const courses = [mockCourse];
      const orderId = 'uuid';

      jest.spyOn(mockEntityManager, 'save').mockResolvedValue(mockOrderCourse);

      const result =
        await orderCourseService.saveOrderCourseRepoWithTransaction(
          courses,
          orderId,
          mockEntityManager,
        );

      expect(result.flat()).toEqual(mockOrderCourse);
      expect(mockEntityManager.save).toBeCalledWith(OrderCourseEntity, {
        orderPrice: mockCourse.price,
        fk_order_id: orderId,
        fk_course_id: mockCourse.id,
      });
    });
  });
});
