import { Test, TestingModule } from '@nestjs/testing';
import { CourseWishService } from '@src/course_wish/course_wish.service';

describe('CourseWishService', () => {
  let service: CourseWishService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseWishService],
    }).compile();

    service = module.get<CourseWishService>(CourseWishService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
