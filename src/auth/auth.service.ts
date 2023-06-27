import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RoleType } from '../user/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(loginUserDto: LoginUserDto) {}

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
        secret: process.env.JWT_AT_SECRET,
        expiresIn: process.env.JWT_AT_EXPIRESIN,
      },
    );

    return refreshToken;
  }

  async hashData(data: string) {
    return bcrypt.hash(data, 10);
  }
}
