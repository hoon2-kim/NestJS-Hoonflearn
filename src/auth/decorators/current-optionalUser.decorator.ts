import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

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
