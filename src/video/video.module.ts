import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEntity } from './entities/video.entity';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { CourseModule } from 'src/course/course.module';
import { LessonModule } from 'src/lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity]),
    AwsS3Module,
    CourseModule,
    LessonModule,
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
