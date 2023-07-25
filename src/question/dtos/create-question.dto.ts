import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
