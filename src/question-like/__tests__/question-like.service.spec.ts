import { Test, TestingModule } from '@nestjs/testing';
import { QuestionLikeService } from '../question-like.service';

describe('QuestionLikeService', () => {
  let service: QuestionLikeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionLikeService],
    }).compile();

    service = module.get<QuestionLikeService>(QuestionLikeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
