import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionLikeEntity } from './entities/question-like.entity';
import { QuestionLikeService } from './question-like.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionLikeEntity])],
  providers: [QuestionLikeService],
  exports: [QuestionLikeService],
})
export class QuestionLikeModule {}
