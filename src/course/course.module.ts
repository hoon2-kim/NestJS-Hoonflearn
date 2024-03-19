import { Module } from '@nestjs/common';
import { CourseService } from '@src/course/course.service';
import { CourseController } from '@src/course/course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '@src/course/entities/course.entity';
import { CategoryModule } from '@src/category/category.module';
import { CategoryCourseModule } from '@src/category_course/category_course.module';
import { CourseWishModule } from '@src/course/course-wish/course-wish.module';
import { AwsS3Module } from '@src/aws-s3/aws-s3.module';
import { CourseUserModule } from '@src/course_user/course-user.module';
import { QuestionEntity } from '@src/question/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, QuestionEntity]),
    CategoryModule,
    CategoryCourseModule,
    CourseWishModule,
    AwsS3Module,
    CourseUserModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
