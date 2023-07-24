import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseUserService } from './course_user.service';
import { CourseUserEntity } from './entities/course-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseUserEntity])],
  providers: [CourseUserService],
  exports: [CourseUserService],
})
export class CourseUserModule {}
