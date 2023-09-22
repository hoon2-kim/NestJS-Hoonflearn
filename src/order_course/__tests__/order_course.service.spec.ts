import { Test, TestingModule } from '@nestjs/testing';
import { OrderCourseService } from '@src/order_course/order-course.service';

describe('OrderCourseService', () => {
  let service: OrderCourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderCourseService],
    }).compile();

    service = module.get<OrderCourseService>(OrderCourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
