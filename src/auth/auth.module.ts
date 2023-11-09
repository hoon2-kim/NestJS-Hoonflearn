import { Module } from '@nestjs/common';
import { AuthController } from '@src/auth/auth.controller';
import { AuthService } from '@src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAtStrategy } from '@src/auth/strategies/jwt-at.strategy';
import { JwtRtStrategy } from '@src/auth/strategies/jwt-rt.strategy';
import { UserModule } from '@src/user/user.module';
import { JwtRedisService } from '@src/auth/jwt-redis/jwt-redis.service';

@Module({
  imports: [JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAtStrategy, JwtRtStrategy, JwtRedisService],
  exports: [AuthService],
})
export class AuthModule {}
