import { Test, TestingModule } from '@nestjs/testing';
import { QuestionCommentService } from '../question-comment.service';

describe('QuestionCommentService', () => {
  let service: QuestionCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionCommentService],
    }).compile();

    service = module.get<QuestionCommentService>(QuestionCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
