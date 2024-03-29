import { Module } from '@nestjs/common';
import { CartService } from '@src/cart/cart.service';
import { CartController } from '@src/cart/cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from '@src/cart/entities/cart.entity';
import { CartCourseModule } from '@src/cart_course/cart_course.module';
import { CourseModule } from '@src/course/course.module';
import { CourseUserModule } from '@src/course_user/course-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity]),
    CartCourseModule,
    CourseModule,
    CourseUserModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
