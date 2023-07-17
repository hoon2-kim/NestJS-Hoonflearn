import {
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLessonDto {
  @IsUUID()
  @IsNotEmpty()
  sectionId!: string;

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
