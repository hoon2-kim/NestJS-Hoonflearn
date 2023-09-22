import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseUserService } from '@src/course_user/course-user.service';
import { CourseUserEntity } from '@src/course_user/entities/course-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseUserEntity])],
  providers: [CourseUserService],
  exports: [CourseUserService],
})
export class CourseUserModule {}
