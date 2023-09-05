import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PageOptionDto {
  @ApiPropertyOptional({
    description: '페이지번호',
    type: 'number',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 아이템 수',
    type: 'number',
    default: 15,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  take?: number = 15;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
