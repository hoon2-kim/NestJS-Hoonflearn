import { Test, TestingModule } from '@nestjs/testing';
import { ReviewCommentController } from '../review-comment.controller';
import { ReviewCommentService } from '../review-comment.service';

describe('ReviewCommentController', () => {
  let controller: ReviewCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewCommentController],
      providers: [ReviewCommentService],
    }).compile();

    controller = module.get<ReviewCommentController>(ReviewCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
