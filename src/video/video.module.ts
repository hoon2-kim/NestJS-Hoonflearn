import { Module } from '@nestjs/common';
import { VideoService } from '@src/video/video.service';
import { VideoController } from '@src/video/video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEntity } from '@src/video/entities/video.entity';
import { CourseModule } from '@src/course/course.module';
import { LessonModule } from '@src/lesson/lesson.module';
import { AwsS3Module } from '@src/aws-s3/aws-s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity]),
    CourseModule,
    LessonModule,
    AwsS3Module,
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
