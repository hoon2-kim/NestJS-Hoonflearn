import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryCourseService } from '@src/category_course/category_course.service';
import { CategoryCourseEntity } from '@src/category_course/entities/category-course.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryCourseEntity])],
  providers: [CategoryCourseService],
  exports: [CategoryCourseService],
})
export class CategoryCourseModule {}
