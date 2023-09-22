import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from '@src/course/course.module';
import { CartCourseService } from '@src/cart_course/cart_course.service';
import { CartCourseEntity } from '@src/cart_course/entities/cart-course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartCourseEntity]), CourseModule],
  providers: [CartCourseService],
  exports: [CartCourseService],
})
export class CartCourseModule {}
