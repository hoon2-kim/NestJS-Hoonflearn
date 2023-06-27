import { AuthGuard } from '@nestjs/passport';

export class RtGuard extends AuthGuard(process.env.JWT_RT_NAME) {}
