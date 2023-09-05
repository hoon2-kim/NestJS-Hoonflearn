import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  ApiLoginSwagger,
  ApiLogoutSwagger,
  ApiRestoreAccessTokenSwagger,
} from './auth.swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginUserDto } from './dtos/request/login-user.dto';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';
import { IAuthLogin, IAuthRestore } from './interfaces/auth.interface';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiLoginSwagger('로그인')
  @Post('/login')
  loginUser(
    @Body() loginUserDto: LoginUserDto, //
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthLogin> {
    return this.authService.login(loginUserDto, res);
  }

  @ApiLogoutSwagger('로그아웃')
  @Post('/logout')
  @UseGuards(AtGuard)
  logoutUser(
    @CurrentUser('id') userId: string, //
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    return this.authService.logout(userId, res);
  }

  @ApiRestoreAccessTokenSwagger('access_token 만료시 재발급')
  @Post('/refresh')
  @UseGuards(RtGuard)
  restoreAccessToken(
    @CurrentUser('id') userId: string, //
    @Req() req: Request,
  ): Promise<IAuthRestore> {
    return this.authService.restore(userId, req);
  }
}
