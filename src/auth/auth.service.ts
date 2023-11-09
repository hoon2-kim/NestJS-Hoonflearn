import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { LoginUserDto } from '@src/auth/dtos/request/login-user.dto';
import { Response } from 'express';
import { UserService } from '@src/user/user.service';
import { IAuthToken } from '@src/auth/interfaces/auth.interface';
import { ERoleType } from '@src/user/enums/user.enum';
import { JwtRedisService } from '@src/auth/jwt-redis/jwt-redis.service';
import { UserEntity } from '@src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly jwtRedisService: JwtRedisService,
  ) {}

  async login(loginUserDto: LoginUserDto, res: Response): Promise<IAuthToken> {
    const { email, password } = loginUserDto;

    const user = await this.userService.findOneByOptions({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('유저가 존재하지 않습니다.');
    }
    const validatePassword = await bcryptjs.compare(password, user.password);

    if (!validatePassword) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    const at = this.getAccessToken(user.id, user.email, user.role);
    const rt = this.getRefreshToken(user.id, user.email, user.role);

    /** redis에 refresh_token 저장 */
    await this.jwtRedisService.setRefreshToken(email, rt);

    /** refreshToken 쿠키 설정 */
    res.cookie('refreshToken', rt, {
      httpOnly: true,
      secure: false, // https 환경에서는 true
      sameSite: 'none',
      path: '/',
    });

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async logout(user: UserEntity, res: Response): Promise<string> {
    const redisRt = await this.jwtRedisService.getRefreshToken(user.email);

    if (!redisRt) {
      throw new UnauthorizedException('이미 로그아웃 하셨습니다.');
    }

    /** 쿠키에 있는 refreshToken 빈값으로 변경 및 만료시간 과거로 설정 */
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      path: '/',
      expires: new Date(0),
    });

    /** redis에 저장되어있는 refresh_token 삭제 */
    await this.jwtRedisService.delRefreshToken(user.email);

    return '로그아웃 성공';
  }

  async restore(cookieRt: string): Promise<IAuthToken> {
    const decoded = await this.jwtService.verifyAsync(cookieRt, {
      secret: process.env.JWT_RT_SECRET,
    });

    const redisRt = await this.jwtRedisService.getRefreshToken(decoded.email);

    if (cookieRt !== redisRt || !redisRt) {
      throw new UnauthorizedException('invalid refresh_token');
    }

    const newAt = this.getAccessToken(decoded.id, decoded.email, decoded.role);

    const newRt = this.getRefreshToken(decoded.id, decoded.email, decoded.role);

    await this.jwtRedisService.setRefreshToken(decoded.email, newRt);

    return { access_token: newAt, refresh_token: newRt };
  }

  getAccessToken(userId: string, userEmail: string, role: ERoleType): string {
    const accessToken = this.jwtService.sign(
      {
        id: userId,
        email: userEmail,
        role,
      },
      {
        secret: process.env.JWT_AT_SECRET,
        expiresIn: process.env.JWT_AT_EXPIRESIN,
      },
    );

    return accessToken;
  }

  getRefreshToken(userId: string, userEmail: string, role: ERoleType): string {
    const refreshToken = this.jwtService.sign(
      {
        id: userId,
        email: userEmail,
        role,
      },
      {
        secret: process.env.JWT_RT_SECRET,
        expiresIn: process.env.JWT_RT_EXPIRESIN,
      },
    );

    return refreshToken;
  }
}
