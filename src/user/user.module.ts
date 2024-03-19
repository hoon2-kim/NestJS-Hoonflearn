import { Module } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { UserController } from '@src/user/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@src/user/entities/user.entity';
import { AwsS3Module } from '@src/aws-s3/aws-s3.module';
import { CourseWishModule } from '@src/course/course-wish/course-wish.module';
import { QuestionModule } from '@src/question/question.module';
import { CourseUserModule } from '@src/course_user/course-user.module';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { CartModule } from '@src/cart/cart.module';
import { CoolsmsModule } from '@src/coolsms/coolsms.module';
import { RedisModule } from '@src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, InstructorProfileEntity]),
    AwsS3Module,
    CourseWishModule,
    QuestionModule,
    CourseUserModule,
    CartModule,
    CoolsmsModule,
    RedisModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
