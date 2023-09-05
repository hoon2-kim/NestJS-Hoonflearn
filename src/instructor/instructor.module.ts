import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorProfileEntity } from './entities/instructor-profile.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/course/course.module';
import { QuestionModule } from 'src/question/question.module';
import { UserEntity } from 'src/user/entities/user.entity';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstructorProfileEntity, UserEntity]),
    AuthModule,
    UserModule,
    CourseModule,
    QuestionModule,
    ReviewModule,
  ],
  controllers: [InstructorController],
  providers: [InstructorService],
})
export class InstructorModule {}
