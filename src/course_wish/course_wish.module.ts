import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseWishService } from './course_wish.service';
import { CourseWishEntity } from './entities/course-wish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseWishEntity])],
  providers: [CourseWishService],
  exports: [CourseWishService],
})
export class CourseWishModule {}
