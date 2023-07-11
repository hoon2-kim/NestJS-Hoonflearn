import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
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
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginUserDto, res);
  }

  @Post('/logout')
  @UseGuards(AtGuard)
  logoutUser(
    @CurrentUser('id') userId: string, //
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(userId, res);
  }

  @Post('/refresh')
  @UseGuards(RtGuard)
  restoreAccessToken(
    @CurrentUser('id') userId: string, //
    @Req() req: Request,
  ) {
    return this.authService.restore(userId, req);
  }

  // 테스트용
  @Get('/test')
  @UseGuards(AtGuard)
  test(@CurrentUser() user: UserEntity) {
    return user;
  }
}
