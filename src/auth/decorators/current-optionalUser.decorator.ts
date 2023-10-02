import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * 비로그인+로그인 유저에 관한 데코레이터
 * 비로그인일 경우 null 반환
 */
export const CurrentOptionalUser = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      return null;
    }

    return !data ? user : user[data];
  },
);
