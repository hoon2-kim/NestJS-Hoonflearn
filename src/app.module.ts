import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CategoryCourseModule } from './category_course/category_course.module';
import { CourseModule } from './course/course.module';
import { CourseUserModule } from './course_user/course-user.module';
import { CourseWishModule } from './course_wish/course_wish.module';
import { InstructorModule } from './instructor/instructor.module';
import { LessonModule } from './lesson/lesson.module';
import { QuestionCommentModule } from './question-comment/question-comment.module';
import { QuestionModule } from './question/question.module';
import { ReviewCommentModule } from './review-comment/review-comment.module';
import { ReviewModule } from './review/review.module';
import { SectionModule } from './section/section.module';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';
import { QuestionVoteModule } from './question-vote/question-vote.module';
import { ReviewLikeModule } from './review-like/review-like.module';
import { CartModule } from './cart/cart.module';
import { CartCourseModule } from './cart_course/cart_course.module';
import { OrderModule } from './order/order.module';
import { OrderCourseModule } from './order_course/order-course.module';
import { VoucherModule } from './voucher/voucher.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { typeOrmModuleConfig } from './config/database';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env' : '.env.prod',
    }),
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
    CacheModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
