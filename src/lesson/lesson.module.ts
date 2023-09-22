import { Module } from '@nestjs/common';
import { LessonService } from '@src/lesson/lesson.service';
import { LessonController } from '@src/lesson/lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { CourseModule } from '@src/course/course.module';
import { SectionModule } from '@src/section/section.module';
import { CourseUserModule } from '@src/course_user/course-user.module';
import { AwsS3Module } from '@src/aws-s3/aws-s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonEntity]),
    SectionModule,
    CourseModule,
    CourseUserModule,
    AwsS3Module,
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
