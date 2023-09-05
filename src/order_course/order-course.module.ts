import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderCourseEntity } from './entities/order-course.entity';
import { OrderCourseService } from './order-course.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderCourseEntity])],
  providers: [OrderCourseService],
  exports: [OrderCourseService],
})
export class OrderCourseModule {}
