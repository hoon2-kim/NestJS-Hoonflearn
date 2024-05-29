import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { LoginUserDto } from '@src/auth/dtos/login-user.dto';
import { Response } from 'express';
import { UserService } from '@src/user/user.service';
import { IAuthToken, IJwtPayload } from '@src/auth/interfaces/auth.interface';
import { CustomRedisService } from '@src/redis/redis.service';
import { UserEntity } from '@src/user/entities/user.entity';
import { CreateUserDto } from '@src/user/dtos/create-user.dto';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { OAuth2Client } from 'google-auth-library';
import { jwtRefreshTokenKey } from '@src/redis/keys';

@Injectable()
export class AuthService {
  private google: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly redisService: CustomRedisService,
  ) {
    this.google = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  }

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

    const tokens = await this.getJwtTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    /** redis에 refresh_token 저장 */
    const ttl = +process.env.JWT_RT_SECONDS;
    await this.redisService.set(
      jwtRefreshTokenKey(email),
      tokens.refresh_token,
      ttl,
    );

    /** refreshToken 쿠키 설정 */
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development' ? false : true, // https 환경에서는 true
      sameSite: 'none',
      path: '/',
      maxAge: parseInt(process.env.JWT_RT_COOKIE_MAX_AGE),
    });

    return tokens;
  }

  async socialLogin(googleTokenDto: GoogleTokenDto, res: Response) {
    const ticket = await this.google.verifyIdToken({
      idToken: googleTokenDto.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const data = ticket.getPayload();

    const user = await this.userService.findOneByOptions({
      where: { email: data.email },
    });

    if (user && user.loginType === 'email') {
      throw new BadRequestException('해당 이메일로 이미 일반가입 하셨습니다.');
    }

    /** 처음 소셜로그인(구글)이라면 새로 가입 */
    if (!user) {
      const newUser = new CreateUserDto();
      newUser.email = data.email;
      newUser.nickname = data.email;
      newUser.password = '';

      const result = await this.userService.create(newUser, 'google');
      const tokens = await this.getJwtTokens({
        id: result.id,
        email: result.email,
        role: result.role,
      });

      res.cookie('refreshToken', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development' ? false : true, // https 환경에서는 true
        sameSite: 'none',
        path: '/',
        maxAge: parseInt(process.env.JWT_RT_COOKIE_MAX_AGE),
      });

      return {
        user: result,
        tokens,
      };
    } else {
      const tokens = await this.getJwtTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.cookie('refreshToken', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development' ? false : true, // https 환경에서는 true
        sameSite: 'none',
        path: '/',
        maxAge: parseInt(process.env.JWT_RT_COOKIE_MAX_AGE),
      });

      return tokens;
    }
  }

  async logout(user: IJwtPayload, res: Response): Promise<void> {
    const redisRt = await this.redisService.get(jwtRefreshTokenKey(user.email));

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
    await this.redisService.del(jwtRefreshTokenKey(user.email));
  }

  async restore(cookieRt: string, res: Response): Promise<IAuthToken> {
    const decoded = await this.jwtService.verifyAsync(cookieRt, {
      secret: process.env.JWT_RT_SECRET,
    });

    const redisRt = await this.redisService.get(
      jwtRefreshTokenKey(decoded.email),
    );

    if (!redisRt) {
      throw new UnauthorizedException('이미 로그아웃 하셨습니다.');
    }

    if (cookieRt !== redisRt) {
      /** 로그아웃 처리 */
      await this.redisService.del(jwtRefreshTokenKey(decoded.email));
      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development' ? false : true,
        sameSite: 'none',
        path: '/',
        expires: new Date(0),
      });

      throw new UnauthorizedException('invalid refresh_token - 로그아웃 처리');
    }

    const tokens = await this.getJwtTokens({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    const ttl = +process.env.JWT_RT_SECONDS;
    await this.redisService.set(
      jwtRefreshTokenKey(decoded.email),
      tokens.refresh_token,
      ttl,
    );

    return tokens;
  }

  async getJwtTokens(
    payload: Pick<UserEntity, 'id' | 'email' | 'role'>,
  ): Promise<IAuthToken> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_AT_SECRET,
        expiresIn: process.env.JWT_AT_EXPIRESIN,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_RT_SECRET,
        expiresIn: process.env.JWT_RT_EXPIRESIN,
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
