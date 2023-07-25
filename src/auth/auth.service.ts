import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dtos/login-user.dto';
import { Response, Request } from 'express';
import { UserService } from 'src/user/user.service';
import { RoleType } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(loginUserDto: LoginUserDto, res: Response) {
    const { email, password } = loginUserDto;

    // 이메일 중복확인
    const user = await this.userService.findOneByOptions({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('유저가 존재하지 않습니다.');
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    // 비밀번호 확인
    if (!validatePassword) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    const at = this.getAccessToken(user.id, user.email, user.role);
    const rt = this.getRefreshToken(user.id, user.email, user.role);

    const rtHash = await this.hashData(rt);

    // refreshToken DB 저장
    await this.userService.updateRefreshToken(user.id, rtHash);

    // refreshToken 쿠키 설정
    res.cookie('refreshToken', rt, {
      httpOnly: true,
      secure: false, // https 환경에서는 true
      sameSite: 'none',
      path: '/',
    });

    return {
      access_token: at,
      user,
    };
  }

  async logout(userId: string, res: Response) {
    try {
      // DB에 저장된 refreshToken = null
      await this.userService.removeRefreshToken(userId);

      // 쿠키에 있는 refreshToken 빈값으로 변경 및 만료시간 과거로 설정
      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        path: '/',
        expires: new Date(0),
      });

      return '로그아웃 성공';
    } catch (error) {
      throw new HttpException(
        '로그아웃 실패',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restore(userId: string, req: Request) {
    const user = await this.userService.findOneByOptions({
      where: { id: userId },
    });

    const cookieRt = req?.cookies?.refreshToken;

    console.log('a:', cookieRt, 'b:', user.hashedRt);

    const compareRt = await bcrypt.compare(cookieRt, user.hashedRt);

    if (!compareRt) {
      throw new ForbiddenException(
        'DB의 refreshToken과 쿠키의 refreshToken이 다릅니다.',
      );
    }

    const newAt = this.getAccessToken(user.id, user.email, user.role);

    return { access_token: newAt };
  }

  getAccessToken(userId: string, userEmail: string, role: RoleType) {
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

  getRefreshToken(userId: string, userEmail: string, role: RoleType) {
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

  async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
}
