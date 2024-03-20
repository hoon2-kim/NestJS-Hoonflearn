import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '@src/auth/interfaces/auth.interface';

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtRtStrategy.extractJWT]),
      secretOrKey: configService.get<string>('JWT_RT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IJwtPayload) {
    const rt = JwtRtStrategy.extractJWT(req);

    if (!rt) {
      throw new UnauthorizedException('refreshToken이 존재하지 않습니다.');
    }

    return {
      ...payload,
      refreshToken: rt,
    };
  }

  private static extractJWT(req: Request) {
    if (
      req.cookies &&
      'refreshToken' in req.cookies &&
      req.cookies.refreshToken
    ) {
      return req.cookies.refreshToken;
    }

    return null;
  }
}
