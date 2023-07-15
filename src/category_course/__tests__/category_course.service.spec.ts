import { Test, TestingModule } from '@nestjs/testing';
import { CategoryCourseService } from '../category_course.service';

describe('CategoryCourseService', () => {
  let service: CategoryCourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryCourseService],
    }).compile();

    service = module.get<CategoryCourseService>(CategoryCourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
