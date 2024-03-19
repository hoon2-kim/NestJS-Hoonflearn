import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateSectionDto } from '@src/section/dtos/create-section.dto';

export class UpdateSectionDto extends PartialType(
  OmitType(CreateSectionDto, ['courseId'] as const),
) {
  @IsOptional()
  title?: string;

  @IsOptional()
  goal?: string;
}
