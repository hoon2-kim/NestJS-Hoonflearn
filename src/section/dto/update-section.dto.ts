import { PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateSectionDto } from './create-section.dto';

export class UpdateSectionDto extends PartialType(CreateSectionDto) {
  @IsOptional()
  title?: string;
}
