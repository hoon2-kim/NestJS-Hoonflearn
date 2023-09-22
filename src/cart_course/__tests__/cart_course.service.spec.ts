import { Test, TestingModule } from '@nestjs/testing';
import { CartCourseService } from '@src/cart_course/cart_course.service';

describe('CartCourseService', () => {
  let service: CartCourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartCourseService],
    }).compile();

    service = module.get<CartCourseService>(CartCourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
