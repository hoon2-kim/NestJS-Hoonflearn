import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AtGuard } from '../auth/guard/at.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReturnUserProfile } from './dto/return-user-profile.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  @UseGuards(AtGuard)
  async getMyUserProfile(
    @CurrentUser() user: UserEntity, //
  ): Promise<ReturnUserProfile> {
    return new ReturnUserProfile(await this.userService.getProfile(user));
  }

  @Post('/signup')
  registerUser(
    @Body() createUserDto: CreateUserDto, //
  ) {
    return this.userService.create(createUserDto);
  }

  @Patch('/profile')
  @UseGuards(AtGuard)
  updateUserProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Patch('/profile/avatar')
  @UseGuards(AtGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  uploadUserAvatar(
    @CurrentUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    return this.userService.upload(user, file);
  }

  // TODO : 탈퇴 전 비밀번호 확인하기
  @Delete('/withdrawal')
  @UseGuards(AtGuard)
  withdrawalUser(
    @CurrentUser() user: UserEntity, //
  ) {
    return this.userService.delete(user);
  }
}
