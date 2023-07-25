import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { CategoryModule } from 'src/category/category.module';
import { CategoryCourseModule } from 'src/category_course/category_course.module';
import { CourseWishModule } from 'src/course_wish/course_wish.module';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity]),
    CategoryModule,
    CategoryCourseModule,
    CourseWishModule,
    AwsS3Module,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
