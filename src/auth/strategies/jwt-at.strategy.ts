import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '@src/user/user.service';
import { IJwtPayload } from '@src/auth/interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAtStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    private readonly userService: UserService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_AT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: IJwtPayload) {
    const { email } = payload;

    const user = await this.userService.findOneByOptions({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('유저가 존재하지 않습니다.');
    }

    return payload;
  }
}
