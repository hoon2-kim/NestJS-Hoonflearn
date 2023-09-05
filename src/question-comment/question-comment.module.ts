import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionModule } from 'src/question/question.module';
import { QuestionCommentEntity } from './entities/question-comment.entity';
import { QuestionCommentController } from './question-comment.controller';
import { QuestionCommentService } from './question-comment.service';
import { QuestionRecommentService } from './question-recomment.service';
import { QuestionRecommentController } from './question-recomment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionCommentEntity]), QuestionModule],
  controllers: [QuestionCommentController, QuestionRecommentController],
  providers: [QuestionCommentService, QuestionRecommentService],
})
export class QuestionCommentModule {}
