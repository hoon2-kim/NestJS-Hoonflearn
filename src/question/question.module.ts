import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/question.entity';
import { CourseModule } from '../course/course.module';
import { QuestionLikeModule } from 'src/question-like/question-like.module';
import { CourseUserModule } from 'src/course_user/course-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionEntity]),
    CourseModule,
    QuestionLikeModule,
    CourseUserModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
