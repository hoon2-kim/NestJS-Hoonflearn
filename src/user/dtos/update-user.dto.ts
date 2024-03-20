import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateUserDto } from '@src/user/dtos/create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email'] as const),
) {
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: '유저 자기소개 작성 or 수정' })
  @IsOptional()
  description?: string;
}
