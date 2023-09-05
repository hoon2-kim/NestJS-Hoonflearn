import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserEntity } from 'src/user/entities/user.entity';
import { ERoleType } from 'src/user/enums/user.enum';
import { META_ROLE } from '../decorators/role-protected.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRole = this.reflector.get(META_ROLE, context.getHandler());

    const req = context.switchToHttp().getRequest();

    const user = req.user as UserEntity;

    if (!validRole) {
      return true;
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!validRole.includes(user.role)) {
      throw new ForbiddenException('지식공유자만 가능합니다.');
    }

    return this.matchRoles(validRole, user.role);
  }

  matchRoles(roles: ERoleType[], userRole: ERoleType) {
    return roles.some((role) => role === userRole);
  }
}

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const roles = this.reflector.get<Role[]>(ROLE_KEY, context.getHandler());

//     if (!roles) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest();
//     const user = request.user as PayloadToken;

//     const isAuth = roles.some((role) => role === user.role);
//     if (!isAuth) {
//       throw new UnauthorizedException('Invalid role');
//     }
//     return isAuth;
//   }

//   handleRequest(err, user) {
//     if (err || !user) {
//       throw new HttpException(
//         {
//           status: HttpStatus.UNAUTHORIZED,
//           error: 'This user does not have the required permissions',
//         },
//         HttpStatus.UNAUTHORIZED,
//       );
//     }

//     return user;
//   }
// }