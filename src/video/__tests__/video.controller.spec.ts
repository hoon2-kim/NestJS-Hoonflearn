import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from '@src/video/video.controller';
import { VideoService } from '@src/video/video.service';
import { mockCreatedInstructor } from '@test/__mocks__/user.mock';
import { mockCreatedVideo, mockVideoService } from '@test/__mocks__/video.mock';

describe('VideoController', () => {
  let videoController: VideoController;
  let videoService: VideoService;

  const lessonId = 'uuid';
  const user = mockCreatedInstructor;
  const videoId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: VideoService,
          useValue: mockVideoService,
        },
      ],
    }).compile();

    videoController = module.get<VideoController>(VideoController);
    videoService = module.get<VideoService>(VideoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(videoController).toBeDefined();
    expect(videoService).toBeDefined();
  });

  describe('[VideoController.uploadVideo] - 영상 업로드', () => {
    const file = {
      fieldname: 'video',
      originalname: '영상.mp4',
      encoding: '7bit',
      mimetype: 'video/mp4',
      buffer: Buffer.from('영상.mp4'),
      size: 9902365,
    } as Express.Multer.File;

    it('영상 업로드 성공', async () => {
      jest.spyOn(videoService, 'upload').mockResolvedValue(mockCreatedVideo);

      const result = await videoController.uploadVideo(lessonId, file, user);

      expect(result).toEqual(mockCreatedVideo);
      expect(videoService.upload).toBeCalled();
      expect(videoService.upload).toBeCalledWith(lessonId, file, user);
    });

    it('영상 업로드 실패 - 파일이 없는 경우(400에러)', async () => {
      try {
        await videoController.uploadVideo(lessonId, null, user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('영상 업로드 실패 - 파일이 limit사이즈를 초과한 경우(400에러)', async () => {
      const bigFile = { ...file, size: 1024 * 1024 * 1024 * 5 };

      try {
        await videoController.uploadVideo(lessonId, bigFile, user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('영상 업로드 실패 - 영상 확장자가 mpg,mv4,mov,m2ts,mp4가 아닌 경우(400에러)', async () => {
      const etcFile = { ...file, mimetype: 'video/avi' };

      try {
        await videoController.uploadVideo(lessonId, etcFile, user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[VideoController.deleteVideo] - 영상 업로드 삭제', () => {
    it('영상 삭제 성공', async () => {
      jest.spyOn(videoService, 'delete').mockResolvedValue(true);

      const result = await videoController.deleteVideo(videoId, user);

      expect(result).toBe(true);
      expect(videoService.delete).toBeCalled();
      expect(videoService.delete).toBeCalledWith(videoId, user);
    });
  });
});
