import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  goal: string;
}
