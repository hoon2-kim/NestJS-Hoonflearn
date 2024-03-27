import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from '@src/auth/auth.service';
import {
  ApiLoginSwagger,
  ApiLogoutSwagger,
  ApiRestoreAccessTokenSwagger,
} from '@src/auth/auth.swagger';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { LoginUserDto } from '@src/auth/dtos/login-user.dto';
import { AtGuard } from '@src/auth/guards/at.guard';
import { RtGuard } from '@src/auth/guards/rt.guard';
import { IAuthToken, IJwtPayload } from '@src/auth/interfaces/auth.interface';
import { GoogleTokenDto } from '@src/auth/dtos/google-token.dto';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiLoginSwagger('로그인')
  @Post('/login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthToken> {
    return await this.authService.login(loginUserDto, res);
  }

  @ApiLogoutSwagger('로그아웃')
  @Post('/logout')
  @UseGuards(AtGuard)
  async logoutUser(
    @CurrentUser() user: IJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    return await this.authService.logout(user, res);
  }

  @ApiRestoreAccessTokenSwagger('access_token 만료시 재발급')
  @Post('/refresh')
  @UseGuards(RtGuard)
  async restoreAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthToken> {
    const cookieRt = req.cookies?.refreshToken;

    return await this.authService.restore(cookieRt, res);
  }

  @Post('/login/google')
  async googleLogin(
    @Body() googleTokenDto: GoogleTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.socialLogin(googleTokenDto, res);
  }
}
