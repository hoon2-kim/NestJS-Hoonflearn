import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { VideoService } from '@src/video/video.service';
import { CourseService } from '@src/course/course.service';
import { LessonService } from '@src/lesson/lesson.service';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VideoEntity } from '@src/video/entities/video.entity';
import { CourseEntity } from '@src/course/entities/course.entity';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  mockCourseService,
  mockLessonService,
  mockAwsS3Service,
} from '@test/__mocks__/mock-service';
import {
  mockInstructor,
  mockLesson,
  mockSection,
  mockVideo,
} from '@test/__mocks__/mock-data';

jest.mock('../../common/utils/getVideoDuration.ts', () => ({
  getVideoDuration: jest.fn().mockResolvedValue(expect.any(Number)),
}));

const mockQueryRunner = {
  manager: {},
} as QueryRunner;

class MockDataSource {
  createQueryRunner(): QueryRunner {
    return mockQueryRunner;
  }
}

describe('VideoService', () => {
  let videoService: VideoService;
  let courseService: CourseService;
  let lessonService: LessonService;
  let awsS3Service: AwsS3Service;
  let dataSource: DataSource;
  let videoRepository: Repository<VideoEntity>;

  const courseId = 'uuid';
  const lessonId = 'uuid';
  const videoId = 'uuid';
  const updateResult: UpdateResult = {
    generatedMaps: [],
    raw: [],
    affected: 1,
  };

  beforeEach(async () => {
    Object.assign(mockQueryRunner.manager, {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      decrement: jest.fn(),
    });

    mockQueryRunner.connect = jest.fn();
    mockQueryRunner.startTransaction = jest.fn();
    mockQueryRunner.commitTransaction = jest.fn();
    mockQueryRunner.rollbackTransaction = jest.fn();
    mockQueryRunner.release = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: CourseService,
          useValue: mockCourseService,
        },
        { provide: LessonService, useValue: mockLessonService },
        { provide: AwsS3Service, useValue: mockAwsS3Service },
        { provide: DataSource, useClass: MockDataSource },
        { provide: getRepositoryToken(VideoEntity), useValue: {} },
      ],
    }).compile();

    videoService = module.get<VideoService>(VideoService);
    courseService = module.get<CourseService>(CourseService);
    lessonService = module.get<LessonService>(LessonService);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    dataSource = module.get<DataSource>(DataSource);
    videoRepository = module.get<Repository<VideoEntity>>(
      getRepositoryToken(VideoEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(videoService).toBeDefined();
    expect(courseService).toBeDefined();
    expect(lessonService).toBeDefined();
    expect(awsS3Service).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(videoRepository).toBeDefined();
  });

  describe('[영상 업로드]', () => {
    const file = {
      fieldname: 'video',
      originalname: '영상.mp4',
      encoding: '7bit',
      mimetype: 'video/mp4',
      buffer: Buffer.from('영상.mp4'),
      size: 9902365,
    } as Express.Multer.File;

    const uploadUrl = mockVideo.videoUrl;

    let queryRunner: QueryRunner;

    beforeEach(() => {
      queryRunner = dataSource.createQueryRunner();
    });

    it('영상 업로드 성공', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);
      jest.spyOn(awsS3Service, 'uploadFileToS3').mockResolvedValue(uploadUrl);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(mockVideo);
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(mockSection);
      jest.spyOn(queryRunner.manager, 'update').mockResolvedValue(updateResult);
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce({
        id: 'uuid',
        totalVideosTime: expect.any(Number),
      } as CourseEntity);
      jest.spyOn(queryRunner.manager, 'update').mockResolvedValue(updateResult);

      const result = await videoService.upload(lessonId, file, mockInstructor);

      expect(result).toEqual(mockVideo);
      expect(queryRunner.manager.save).toBeCalledTimes(1);
      expect(queryRunner.manager.findOne).toBeCalledTimes(2);
      expect(queryRunner.manager.update).toBeCalledTimes(2);
      expect(queryRunner.commitTransaction).toBeCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toBeCalledTimes(0);
      expect(queryRunner.release).toBeCalledTimes(1);
    });

    it('영상 업로드 실패 - 해당 수업이 없는 경우(404에러)', async () => {
      jest.spyOn(lessonService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await videoService.upload(lessonId, file, mockInstructor);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('영상 업로드 실패 - 이미 업로드 한 경우(400에러)', async () => {
      const mockLessonWithVideo = {
        ...mockLesson,
        video: mockVideo,
      };

      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLessonWithVideo);

      try {
        await videoService.upload(lessonId, file, mockInstructor);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('영상 업로드 실패 - 해당 강의 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseService, 'validateInstructor')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.'),
        );

      try {
        await videoService.upload(lessonId, file, mockInstructor);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('영상 업로드 실패 - S3에 업로드 실패하는 경우(400에러)', async () => {
      jest
        .spyOn(lessonService, 'findOneByOptions')
        .mockResolvedValue(mockLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);
      jest
        .spyOn(awsS3Service, 'uploadFileToS3')
        .mockRejectedValue(new BadRequestException());

      try {
        await videoService.upload(lessonId, file, mockInstructor);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });
  });

  describe('[업로드한 영상 삭제]', () => {
    let queryRunner: QueryRunner;
    const mockVideoWithLesson = {
      ...mockVideo,
      lesson: mockLesson,
    };

    beforeEach(() => {
      queryRunner = dataSource.createQueryRunner();
    });

    it('영상 삭제 성공', async () => {
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(mockVideoWithLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);
      jest
        .spyOn(awsS3Service, 'deleteS3Object')
        .mockResolvedValue({ success: true });
      jest
        .spyOn(queryRunner.manager, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(mockSection);
      jest
        .spyOn(queryRunner.manager, 'decrement')
        .mockResolvedValue(updateResult);
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce({
        id: 'uuid',
        totalVideosTime: expect.any(Number),
      } as CourseEntity);
      jest
        .spyOn(queryRunner.manager, 'decrement')
        .mockResolvedValue(updateResult);

      const result = await videoService.delete(videoId, mockInstructor);

      expect(result).toBeUndefined();
      expect(queryRunner.manager.delete).toBeCalledTimes(1);
      expect(queryRunner.manager.findOne).toBeCalledTimes(3);
      expect(queryRunner.manager.decrement).toBeCalledTimes(2);
      expect(queryRunner.commitTransaction).toBeCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toBeCalledTimes(0);
      expect(queryRunner.release).toBeCalledTimes(1);
    });

    it('영상 업로드 실패 - 해당 영상이 없는 경우(404에러)', async () => {
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);

      try {
        await videoService.delete(lessonId, mockInstructor);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('영상 업로드 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(mockVideoWithLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseService, 'validateInstructor')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.'),
        );

      try {
        await videoService.delete(lessonId, mockInstructor);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('영상 업로드 실패 - S3에서 삭제 실패하는 경우(400에러)', async () => {
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(mockVideoWithLesson);
      jest
        .spyOn(lessonService, 'getCourseIdByLessonIdWithQueryBuilder')
        .mockResolvedValue(courseId);
      jest
        .spyOn(courseService, 'validateInstructor')
        .mockResolvedValue(undefined);
      jest
        .spyOn(awsS3Service, 'deleteS3Object')
        .mockRejectedValue(new BadRequestException());

      try {
        await videoService.delete(lessonId, mockInstructor);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(queryRunner.manager.save).toBeCalledTimes(0);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });
  });
});
