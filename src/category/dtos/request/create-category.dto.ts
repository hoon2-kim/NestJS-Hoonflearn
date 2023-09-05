import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: '카테고리 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
