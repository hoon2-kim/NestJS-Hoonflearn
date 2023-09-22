import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseWishService } from '@src/course_wish/course_wish.service';
import { CourseWishEntity } from '@src/course_wish/entities/course-wish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseWishEntity])],
  providers: [CourseWishService],
  exports: [CourseWishService],
})
export class CourseWishModule {}
