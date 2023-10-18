import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { VideoEntity } from '@src/video/entities/video.entity';
import { CourseService } from '@src/course/course.service';
import { LessonService } from '@src/lesson/lesson.service';
import { URL } from 'url';
import { SectionEntity } from '@src/section/entities/section.entity';
import { CourseEntity } from '@src/course/entities/course.entity';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { getVideoDuration } from '@src/common/helpers/getVideoDuration.helper';

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

  async upload(
    lessonId: string,
    file: Express.Multer.File,
    user: UserEntity,
  ): Promise<VideoEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lesson = await this.lessonService.findOneByOptions(
        { where: { id: lessonId }, relations: ['video'] },
        queryRunner.manager,
      );

      if (!lesson) {
        throw new NotFoundException(
          `해당 수업ID:${lessonId}가 존재하지 않습니다.`,
        );
      }

      if (lesson.video) {
        throw new BadRequestException('이미 영상이 업로드 되었습니다.');
      }

      // courseId 가져오기
      const courseId =
        await this.lessonService.getCourseIdByLessonIdWithQueryBuilder(
          lessonId,
          queryRunner.manager,
        );

      // 지식공유자 검증
      await this.courseService.validateInstructor(courseId, user.id);

      // 업로드
      const folderName = `유저-${user.id}/강의-${courseId}/videos`;

      const s3upload = await this.awsS3Service.uploadFileToS3(folderName, file);

      const videoTime = Math.floor(await getVideoDuration(s3upload));

      const result = await queryRunner.manager.save(VideoEntity, {
        videoUrl: s3upload,
        videoTime,
        fk_lesson_id: lessonId,
      });

      const section = await queryRunner.manager.findOne(SectionEntity, {
        where: { id: lesson.fk_section_id },
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

  async delete(videoId: string, user: UserEntity): Promise<boolean> {
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

      await queryRunner.manager.decrement(
        SectionEntity,
        { id: section.id },
        'totalSectionTime',
        existVideo.videoTime,
      );

      const course = await queryRunner.manager.findOne(CourseEntity, {
        where: { id: courseId },
        select: ['id', 'totalVideosTime'],
      });

      await queryRunner.manager.decrement(
        CourseEntity,
        { id: course.id },
        'totalVideosTime',
        existVideo.videoTime,
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
