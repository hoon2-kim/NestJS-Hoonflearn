import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/question.entity';
import { CourseModule } from '../course/course.module';
import { QuestionVoteModule } from 'src/question-vote/question-vote.module';
import { CourseUserModule } from 'src/course_user/course-user.module';
import { QuestionHitListener } from './listeners/question-hit.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionEntity]),
    CourseModule,
    QuestionVoteModule,
    CourseUserModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionHitListener],
  exports: [QuestionService],
})
export class QuestionModule {}
