import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { ILessonResponse } from '@src/lesson/interfaces/lesson.interface';
import { VideoResponseDto } from '@src/video/dtos/response/video.response.dto';
import { IVideoResponse } from '@src/video/interfaces/video.interface';
import { ApiProperty } from '@nestjs/swagger';

export class LessonResponseDto implements ILessonResponse {
  @ApiProperty({ description: '수업 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '수업 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '수업 노트', type: 'string' })
  note?: string;

  @ApiProperty({ description: '수업 무료 공개 여부', type: 'boolean' })
  isFreePublic: boolean;

  @ApiProperty({
    description: '수업 생성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({ description: '수업의 영상 정보', type: VideoResponseDto })
  video?: IVideoResponse;

  static from(lesson: LessonEntity): LessonResponseDto {
    const dto = new LessonResponseDto();
    const { id, title, note, isFreePublic, created_at, video } = lesson;

    dto.id = id;
    dto.title = title;
    dto.note = note;
    dto.isFreePublic = isFreePublic;
    dto.created_at = created_at;
    dto.video = VideoResponseDto.from(video);

    return dto;
  }
}
