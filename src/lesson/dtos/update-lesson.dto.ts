import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateLessonDto } from '@src/lesson/dtos/create-lesson.dto';

export class UpdateLessonDto extends PartialType(
  OmitType(CreateLessonDto, ['sectionId'] as const),
) {
  @IsOptional()
  title?: string;
}
