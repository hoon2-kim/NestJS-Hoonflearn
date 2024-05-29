import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@src/auth/auth.module';
import { CategoryModule } from '@src/category/category.module';
import { CategoryCourseModule } from '@src/category_course/category_course.module';
import { CourseModule } from '@src/course/course.module';
import { CourseUserModule } from '@src/course_user/course-user.module';
import { CourseWishModule } from '@src/course/course-wish/course-wish.module';
import { InstructorModule } from '@src/instructor/instructor.module';
import { LessonModule } from '@src/lesson/lesson.module';
import { QuestionCommentModule } from '@src/question/question-comment/question-comment.module';
import { QuestionModule } from '@src/question/question.module';
import { ReviewCommentModule } from '@src/review/review-comment/review-comment.module';
import { ReviewModule } from '@src/review/review.module';
import { SectionModule } from '@src/section/section.module';
import { UserModule } from '@src/user/user.module';
import { VideoModule } from '@src/video/video.module';
import { QuestionVoteModule } from '@src/question/question-vote/question-vote.module';
import { ReviewLikeModule } from '@src/review/review-like/review-like.module';
import { CartModule } from '@src/cart/cart.module';
import { CartCourseModule } from '@src/cart_course/cart_course.module';
import { OrderModule } from '@src/order/order.module';
import { OrderCourseModule } from '@src/order_course/order-course.module';
import { VoucherModule } from '@src/voucher/voucher.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { typeOrmModuleConfig } from '@src/common/configs/db/database';
import { AppController } from '@src/app.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomRedisModule } from '@src/redis/redis.module';
import { testTypeOrmModuleConfig } from '@src/common/configs/db/database-test';
import { CouponModule } from './coupon/coupon.module';
import { BullModule } from '@nestjs/bull';
import { CouponUserModule } from './coupon_user/coupon-user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // rate limit
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    process.env.NODE_ENV === 'test'
      ? TypeOrmModule.forRootAsync(testTypeOrmModuleConfig)
      : TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    EventEmitterModule.forRoot(),
    CustomRedisModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        db: 3,
      },
    }),
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
    CouponModule,
    CouponUserModule,
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
