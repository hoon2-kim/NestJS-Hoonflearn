import { ApiProperty } from '@nestjs/swagger';
import { VideoEntity } from 'src/video/entities/video.entity';
import { IVideoResponse } from 'src/video/interfaces/video.interface';

export class VideoResponseDto implements IVideoResponse {
  @ApiProperty({ description: '영상 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: 'AWS-S3에 저장된 영상 url', type: 'string' })
  videoUrl: string;

  @ApiProperty({ description: '영상 길이', type: 'number' })
  videoTime: number;

  @ApiProperty({
    description: '영상 생성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  static from(video: VideoEntity): VideoResponseDto {
    if (!video) {
      return null;
    }

    const dto = new VideoResponseDto();
    const { id, videoUrl, videoTime, created_at } = video;

    dto.id = id;
    dto.videoUrl = videoUrl;
    dto.videoTime = videoTime;
    dto.created_at = created_at;

    return dto;
  }
}
