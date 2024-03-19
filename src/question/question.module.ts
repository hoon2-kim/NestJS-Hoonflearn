import { Module } from '@nestjs/common';
import { QuestionService } from '@src/question/question.service';
import { QuestionController } from '@src/question/question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { CourseModule } from '@src/course/course.module';
import { QuestionVoteModule } from '@src/question/question-vote/question-vote.module';
import { CourseUserModule } from '@src/course_user/course-user.module';
import { QuestionHitListener } from '@src/question/listeners/question-hit.listener';

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
