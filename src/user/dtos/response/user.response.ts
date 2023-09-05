import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entities/user.entity';
import { ERoleType } from 'src/user/enums/user.enum';
import {
  ISimpleUserResponse,
  IUserResponse,
} from 'src/user/interfaces/user.interface';

export class SimpleUserResponseDto implements ISimpleUserResponse {
  @ApiProperty({ description: '유저 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '유저 이메일', type: 'string' })
  email: string;

  @ApiProperty({ description: '유저 닉네임', type: 'string' })
  nickname: string;

  @ApiProperty({
    enum: ERoleType,
    enumName: 'ERoleType',
    description: '유저 역할(일반유저, 강사)',
  })
  role: ERoleType;

  static from(user: UserEntity): SimpleUserResponseDto {
    const dto = new SimpleUserResponseDto();

    dto.id = user.id;
    dto.email = user.email;
    dto.nickname = user.nickname;
    dto.role = user.role;

    return dto;
  }
}

export class UserResponseDto implements IUserResponse {
  @ApiProperty({ description: '유저 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '유저 이메일', type: 'string' })
  email: string;

  @ApiProperty({ description: '유저 닉네임', type: 'string' })
  nickname: string;

  @ApiProperty({ description: '유저 자기소개', type: 'string' })
  description: string;

  @ApiProperty({ description: '유저 프로필이미지', type: 'string' })
  profileAvatar: string;

  @ApiProperty({
    enum: ERoleType,
    enumName: 'ERoleType',
    description: '유저 역할',
  })
  role: ERoleType;

  @ApiProperty({
    description: '유저 생성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: '유저 수정일',
    type: 'string',
    format: 'date-time',
  })
  updated_at: Date;

  static from(user: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();

    dto.id = user.id;
    dto.email = user.email;
    dto.nickname = user.nickname;
    dto.profileAvatar = user.profileAvatar;
    dto.description = user.description;
    dto.role = user.role;
    dto.created_at = user.created_at;
    dto.updated_at = user.updated_at;

    return dto;
  }
}
