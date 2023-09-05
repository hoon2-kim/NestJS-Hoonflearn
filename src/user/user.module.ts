import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { CourseWishModule } from 'src/course_wish/course_wish.module';
import { QuestionModule } from 'src/question/question.module';
import { CourseUserModule } from 'src/course_user/course-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AwsS3Module,
    CourseWishModule,
    QuestionModule,
    CourseUserModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
