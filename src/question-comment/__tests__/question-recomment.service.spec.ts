import { Test, TestingModule } from '@nestjs/testing';
import { QuestionRecommentService } from '@src/question-comment/question-reComment/question-recomment.service';

describe('QuestionRecommentService', () => {
  let service: QuestionRecommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionRecommentService],
    }).compile();

    service = module.get<QuestionRecommentService>(QuestionRecommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
