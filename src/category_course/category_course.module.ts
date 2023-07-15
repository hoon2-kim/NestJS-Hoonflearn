import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryCourseService } from './category_course.service';
import { CategoryCourseEntity } from './entities/category-course.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryCourseEntity])],
  providers: [CategoryCourseService],
  exports: [CategoryCourseService],
})
export class CategoryCourseModule {}
