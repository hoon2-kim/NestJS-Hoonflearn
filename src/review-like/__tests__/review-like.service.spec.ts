import { Test, TestingModule } from '@nestjs/testing';
import { ReviewLikeService } from './review-like.service';

describe('ReviewLikeService', () => {
  let service: ReviewLikeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewLikeService],
    }).compile();

    service = module.get<ReviewLikeService>(ReviewLikeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
