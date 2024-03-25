import { Module } from '@nestjs/common';
import { InstructorService } from '@src/instructor/instructor.service';
import { InstructorController } from '@src/instructor/instructor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { CourseModule } from '@src/course/course.module';
import { QuestionModule } from '@src/question/question.module';
import { UserEntity } from '@src/user/entities/user.entity';
import { ReviewModule } from '@src/review/review.module';
import { RedisService } from '@src/redis/redis.service';
import { CourseEntity } from '@src/course/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstructorProfileEntity,
      UserEntity,
      CourseEntity,
    ]),
    AuthModule,
    UserModule,
    CourseModule,
    QuestionModule,
    ReviewModule,
  ],
  controllers: [InstructorController],
  providers: [InstructorService, RedisService],
})
export class InstructorModule {}
