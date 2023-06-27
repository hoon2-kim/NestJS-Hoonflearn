import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';

const HTTP_STATUS_TOKEN_EXPIRED = 498;

export class AtGuard extends AuthGuard(process.env.JWT_AT_NAME) {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (info instanceof jwt.TokenExpiredError) {
      throw new HttpException('Token expired', HTTP_STATUS_TOKEN_EXPIRED);
    }

    if (err || !user) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized User',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log({ user });

    return user;
  }
}
