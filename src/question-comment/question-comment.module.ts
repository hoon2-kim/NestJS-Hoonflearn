import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionModule } from 'src/question/question.module';
import { QuestionCommentEntity } from './entities/question-comment.entity';
import { QuestionCommentController } from './question-comment.controller';
import { QuestionCommentService } from './question-comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionCommentEntity]), QuestionModule],
  controllers: [QuestionCommentController],
  providers: [QuestionCommentService],
})
export class QuestionCommentModule {}
