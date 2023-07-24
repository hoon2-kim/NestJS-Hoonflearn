import { Test, TestingModule } from '@nestjs/testing';
import { CourseUserService } from '../course_user.service';

describe('CourseUserService', () => {
  let service: CourseUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseUserService],
    }).compile();

    service = module.get<CourseUserService>(CourseUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
