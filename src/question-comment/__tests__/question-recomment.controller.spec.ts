import { Test, TestingModule } from '@nestjs/testing';
import { QuestionRecommentController } from '@src/question-comment/question-recomment.controller';

describe('QuestionRecommentController', () => {
  let controller: QuestionRecommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionRecommentController],
    }).compile();

    controller = module.get<QuestionRecommentController>(
      QuestionRecommentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
