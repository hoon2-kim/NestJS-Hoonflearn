import {
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLessonDto {
  // courseId도 추가할까?

  @IsUUID()
  @IsNotEmpty()
  sectionId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsBoolean()
  @IsOptional()
  isFreePublic?: boolean;
}
