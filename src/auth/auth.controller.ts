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
import { LoginUserDto } from '@src/auth/dtos/request/login-user.dto';
import { AtGuard } from '@src/auth/guards/at.guard';
import { RtGuard } from '@src/auth/guards/rt.guard';
import { IAuthToken } from '@src/auth/interfaces/auth.interface';
import { UserEntity } from '@src/user/entities/user.entity';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiLoginSwagger('로그인')
  @Post('/login')
  loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthToken> {
    return this.authService.login(loginUserDto, res);
  }

  @ApiLogoutSwagger('로그아웃')
  @Post('/logout')
  @UseGuards(AtGuard)
  logoutUser(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    return this.authService.logout(user, res);
  }

  @ApiRestoreAccessTokenSwagger('access_token 만료시 재발급')
  @Post('/refresh')
  @UseGuards(RtGuard)
  restoreAccessToken(@Req() req: Request): Promise<IAuthToken> {
    const cookieRt = req.cookies?.refreshToken;

    return this.authService.restore(cookieRt);
  }
}
