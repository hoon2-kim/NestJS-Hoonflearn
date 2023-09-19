import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { IamportService } from './iamport.service';
import { OrderCourseModule } from 'src/order_course/order-course.module';
import { CartModule } from 'src/cart/cart.module';
import { CourseUserModule } from 'src/course_user/course-user.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    OrderCourseModule,
    CartModule,
    CourseUserModule,
    CourseModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, IamportService],
})
export class OrderModule {}
