import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { CourseModule } from 'src/course/course.module';
import { ReviewLikeModule } from 'src/review-like/review-like.module';
import { CourseUserModule } from 'src/course_user/course-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity]),
    CourseModule,
    ReviewLikeModule,
    CourseUserModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
