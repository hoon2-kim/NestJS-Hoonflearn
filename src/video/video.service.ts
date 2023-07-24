import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { VideoEntity } from './entities/video.entity';
import getVideoDurationInSeconds from 'get-video-duration';
import { CourseService } from 'src/course/course.service';
import { LessonService } from 'src/lesson/lesson.service';
import { URL } from 'url';
import { SectionEntity } from 'src/section/entities/section.entity';
import { CourseEntity } from 'src/course/entities/course.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoEntity)
    private readonly videoRepository: Repository<VideoEntity>,

    private readonly courseService: CourseService,
    private readonly lessonService: LessonService,
    private readonly awsS3Service: AwsS3Service,
    private readonly dataSource: DataSource,
  ) {}

  async upload(lessonId: string, file: Express.Multer.File, user: UserEntity) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existLesson = await this.lessonService.findByOptions(
        {
          where: { id: lessonId },
        },
        queryRunner.manager,
      );

      if (!existLesson) {
        throw new NotFoundException('해당 수업이 존재하지 않습니다.');
      }

      const existVideo = await queryRunner.manager.findOne(VideoEntity, {
        where: { fk_lesson_id: lessonId },
      });

      if (existVideo) {
        throw new BadRequestException('이미 영상이 업로드 되어있습니다.');
      }

      const courseId =
        await this.lessonService.getCourseIdByLessonIdWithQueryBuilder(
          lessonId,
          queryRunner.manager,
        );

      await this.courseService.validateInstructor(courseId, user.id);

      const folderName = `유저-${user.id}/강의-${courseId}/videos`;

      const s3upload = await this.awsS3Service.uploadFileToS3(folderName, file);

      // const videoTime = await getVideoDurationInSeconds(s3upload).then(
      //   (duration) => {
      //     // const hours = Math.floor(duration / 3600);
      //     // const minutes = Math.floor(duration / 60);
      //     // const seconds = Math.floor(duration % 60);

      //     // return Promise.resolve(`${hours}:${minutes}:${seconds}`);

      //     return Promise.resolve(Math.floor(duration));
      //   },
      // );

      const videoTime = Math.floor(await getVideoDurationInSeconds(s3upload));

      const result = await queryRunner.manager.save(VideoEntity, {
        videoUrl: s3upload,
        videoTime,
        fk_lesson_id: lessonId,
      });

      const section = await queryRunner.manager.findOne(SectionEntity, {
        where: { id: existLesson.fk_section_id },
      });
      await queryRunner.manager.update(
        SectionEntity,
        { id: section.id },
        { totalSectionTime: (section.totalSectionTime += videoTime) },
      );

      const course = await queryRunner.manager.findOne(CourseEntity, {
        where: { id: courseId },
        select: ['id', 'totalVideosTime'],
      });

      await queryRunner.manager.update(
        CourseEntity,
        { id: course.id },
        { totalVideosTime: (course.totalVideosTime += videoTime) },
      );

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(videoId: string, user: UserEntity) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existVideo = await queryRunner.manager.findOne(VideoEntity, {
        where: { id: videoId },
        relations: {
          lesson: true,
        },
      });

      if (!existVideo) {
        throw new NotFoundException('업로드된 영상이 없습니다.');
      }

      const courseId =
        await this.lessonService.getCourseIdByLessonIdWithQueryBuilder(
          existVideo.fk_lesson_id,
          queryRunner.manager,
        );

      await this.courseService.validateInstructor(
        courseId,
        user.id,
        queryRunner.manager,
      );

      const url = existVideo.videoUrl;
      const parsedUrl = new URL(url);
      const fileKey = decodeURIComponent(parsedUrl.pathname.substring(1));

      await this.awsS3Service.deleteS3Object(fileKey);

      const result = await queryRunner.manager.delete(VideoEntity, {
        id: videoId,
      });

      const section = await queryRunner.manager.findOne(SectionEntity, {
        where: { id: existVideo.lesson.fk_section_id },
      });
      await queryRunner.manager.update(
        SectionEntity,
        { id: section.id },
        {
          totalSectionTime: (section.totalSectionTime -= existVideo.videoTime),
        },
      );

      const course = await queryRunner.manager.findOne(CourseEntity, {
        where: { id: courseId },
        select: ['id', 'totalVideosTime'],
      });

      await queryRunner.manager.update(
        CourseEntity,
        { id: course.id },
        { totalVideosTime: (course.totalVideosTime -= existVideo.videoTime) },
      );

      await queryRunner.commitTransaction();

      return result.affected ? true : false;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
