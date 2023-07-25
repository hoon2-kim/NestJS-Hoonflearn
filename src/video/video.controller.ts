import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { Roles } from 'src/auth/decorators/role-protected.decorator';
import { RoleType, UserEntity } from 'src/user/entities/user.entity';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  // @Get()
  @Post('/lessons/:lessonId/videos')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  @UseInterceptors(
    FileInterceptor('video', {
      limits: { fileSize: 1073741824 },
    }),
  )
  uploadVideo(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
  ) {
    return this.videoService.upload(lessonId, file, user);
  }

  @Delete('/videos/:videoId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  deleteVideo(
    @Param('videoId') videoId: string, //
    @CurrentUser() user: UserEntity,
  ) {
    return this.videoService.delete(videoId, user);
  }
}
