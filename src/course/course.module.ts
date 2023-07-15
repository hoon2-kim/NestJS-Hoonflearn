import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { CategoryModule } from 'src/category/category.module';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { CategoryCourseModule } from 'src/category_course/category_course.module';
import { CourseWishModule } from 'src/course_wish/course_wish.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity]),
    AwsS3Module,
    CategoryModule,
    CategoryCourseModule,
    CourseWishModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
