import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAtStrategy } from './strategies/jwt-at.strategy';
import { JwtRtStrategy } from './strategies/jwt-rt.strategy';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAtStrategy, JwtRtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
