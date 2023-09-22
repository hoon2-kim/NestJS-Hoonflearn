import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonResponseDto } from '@src/lesson/dtos/response/lesson.response.dto';
import { ILessonResponse } from '@src/lesson/interfaces/lesson.interface';
import { SectionEntity } from '@src/section/entities/section.entity';
import { ISectionResponse } from '@src/section/interfaces/section.interface';

export class SectionResponseDto implements ISectionResponse {
  @ApiProperty({ description: '섹션 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '섹션 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '섹션 목표', type: 'string' })
  goal: string;

  @ApiProperty({ description: '섹션에 속한 수업 영상 총 시간', type: 'number' })
  totalSectionTime: number;

  @ApiProperty({ description: '섹션에 속한 수업의 수', type: 'number' })
  totalLessonBySectionCount: number;

  @ApiProperty({
    description: '섹션 생성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiPropertyOptional({
    description: '섹션에 속한 수업 정보',
    type: LessonResponseDto,
    isArray: true,
  })
  lessons?: ILessonResponse[];

  static from(section: SectionEntity): SectionResponseDto {
    const dto = new SectionResponseDto();
    const {
      id,
      title,
      goal,
      totalLessonBySectionCount,
      totalSectionTime,
      created_at,
      lessons,
    } = section;

    dto.id = id;
    dto.title = title;
    dto.goal = goal;
    dto.totalSectionTime = totalSectionTime;
    dto.totalLessonBySectionCount = totalLessonBySectionCount;
    dto.created_at = created_at;
    dto.lessons = lessons?.map((l) => LessonResponseDto.from(l));

    return dto;
  }
}
