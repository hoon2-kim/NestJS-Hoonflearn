import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionModule } from '@src/question/question.module';
import { QuestionCommentEntity } from '@src/question-comment/entities/question-comment.entity';
import { QuestionCommentController } from '@src/question-comment/question-comment.controller';
import { QuestionCommentService } from '@src/question-comment/question-comment.service';
import { QuestionRecommentService } from '@src/question-comment/question-reComment/question-recomment.service';
import { QuestionRecommentController } from '@src/question-comment/question-reComment/question-recomment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionCommentEntity]), QuestionModule],
  controllers: [QuestionCommentController, QuestionRecommentController],
  providers: [QuestionCommentService, QuestionRecommentService],
})
export class QuestionCommentModule {}
