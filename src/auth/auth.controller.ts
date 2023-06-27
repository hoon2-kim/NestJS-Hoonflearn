import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { AtGuard } from './guard/at.guard';
import { RtGuard } from './guard/rt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  loginUser(
    @Body() loginUserDto: LoginUserDto, //
    @Res() res: Response,
  ) {
    return this.authService.login(loginUserDto);
  }

  @Post('/logout')
  @UseGuards(AtGuard)
  logoutUser(
    @CurrentUser('id') userId: string, //
  ) {
    return this.authService.logout(userId);
  }

  @Post('/refresh')
  @UseGuards(RtGuard)
  restoreAccessToken(
    @CurrentUser() user: UserEntity, //
  ) {
    return this.authService.restore(user);
  }
}
