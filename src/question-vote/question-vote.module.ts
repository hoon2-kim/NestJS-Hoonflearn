import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionVoteEntity } from './entities/question-vote.entity';
import { QuestionVoteService } from './question-vote.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionVoteEntity])],
  providers: [QuestionVoteService],
  exports: [QuestionVoteService],
})
export class QuestionVoteModule {}
