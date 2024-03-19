import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionVoteEntity } from '@src/question/question-vote/entities/question-vote.entity';
import { QuestionVoteService } from '@src/question/question-vote/question-vote.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionVoteEntity])],
  providers: [QuestionVoteService],
  exports: [QuestionVoteService],
})
export class QuestionVoteModule {}
