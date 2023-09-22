import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderCourseEntity } from '@src/order_course/entities/order-course.entity';
import { OrderCourseService } from '@src/order_course/order-course.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderCourseEntity])],
  providers: [OrderCourseService],
  exports: [OrderCourseService],
})
export class OrderCourseModule {}
