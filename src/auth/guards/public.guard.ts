import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';

/**
 * 비로그인+로그인 유저 모두 접근 가능한 API에 사용할 때 로그인 유저 정보는 필요할 때 사용
 */
export class PublicGuard extends AuthGuard('access') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    // 비로그인 유저일 경우
    if (!req.headers.authorization) {
      return true;
    }

    return super.canActivate(context);
  }
}
