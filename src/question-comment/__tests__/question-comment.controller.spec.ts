import { Test, TestingModule } from '@nestjs/testing';
import { QuestionCommentController } from '@src/question-comment/question-comment.controller';

describe('QuestionCommentController', () => {
  let controller: QuestionCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionCommentController],
    }).compile();

    controller = module.get<QuestionCommentController>(
      QuestionCommentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
