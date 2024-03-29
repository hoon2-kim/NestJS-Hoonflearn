import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { VideoService } from '@src/video/video.service';
import { Roles } from '@src/auth/decorators/role-protected.decorator';
import { UserEntity } from '@src/user/entities/user.entity';
import { AtGuard } from '@src/auth/guards/at.guard';
import { RoleGuard } from '@src/auth/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ERoleType } from '@src/user/enums/user.enum';
import { videoFileFilter } from '@src/common/utils/fileFilter';
import {
  ApiDeleteVideoSwagger,
  ApiUploadVideoSwagger,
} from '@src/video/video.swagger';

@ApiTags('VIDEO')
@Roles(ERoleType.Instructor)
@UseGuards(AtGuard, RoleGuard)
@Controller('')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @ApiUploadVideoSwagger('영상 업로드(AWS-S3)')
  @Post('/lessons/:lessonId/videos')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: { fileSize: 1024 * 1024 * 1024 * 4 }, // 4GB
      fileFilter: videoFileFilter,
    }),
  )
  async uploadVideo(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    return await this.videoService.upload(lessonId, file, user);
  }

  @ApiDeleteVideoSwagger('영상 업로드 삭제')
  @Delete('/videos/:videoId')
  async deleteVideo(
    @Param('videoId') videoId: string, //
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return await this.videoService.delete(videoId, user);
  }
}
