import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@src/auth/auth.module';
import { CategoryModule } from '@src/category/category.module';
import { CategoryCourseModule } from '@src/category_course/category_course.module';
import { CourseModule } from '@src/course/course.module';
import { CourseUserModule } from '@src/course_user/course-user.module';
import { CourseWishModule } from '@src/course_wish/course_wish.module';
import { InstructorModule } from '@src/instructor/instructor.module';
import { LessonModule } from '@src/lesson/lesson.module';
import { QuestionCommentModule } from '@src/question-comment/question-comment.module';
import { QuestionModule } from '@src/question/question.module';
import { ReviewCommentModule } from '@src/review-comment/review-comment.module';
import { ReviewModule } from '@src/review/review.module';
import { SectionModule } from '@src/section/section.module';
import { UserModule } from '@src/user/user.module';
import { VideoModule } from '@src/video/video.module';
import { QuestionVoteModule } from '@src/question-vote/question-vote.module';
import { ReviewLikeModule } from '@src/review-like/review-like.module';
import { CartModule } from '@src/cart/cart.module';
import { CartCourseModule } from '@src/cart_course/cart_course.module';
import { OrderModule } from '@src/order/order.module';
import { OrderCourseModule } from '@src/order_course/order-course.module';
import { VoucherModule } from '@src/voucher/voucher.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { typeOrmModuleConfig } from '@src/config/database';
import { AppController } from '@src/app.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // rate limit
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    CategoryModule,
    CourseModule,
    InstructorModule,
    CategoryCourseModule,
    CourseWishModule,
    SectionModule,
    LessonModule,
    VideoModule,
    ReviewModule,
    CourseUserModule,
    QuestionModule,
    ReviewCommentModule,
    QuestionCommentModule,
    QuestionVoteModule,
    ReviewLikeModule,
    CartModule,
    CartCourseModule,
    OrderModule,
    OrderCourseModule,
    VoucherModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
