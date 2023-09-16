import { Test, TestingModule } from '@nestjs/testing';
import { QuestionVoteService } from '../question-vote.service';

describe('QuestionVoteService', () => {
  let service: QuestionVoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionVoteService],
    }).compile();

    service = module.get<QuestionVoteService>(QuestionVoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
