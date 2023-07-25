import { RoleType } from 'src/user/entities/user.entity';

export interface JwtPayload {
  id: string;
  email: string;
  role: RoleType;
}
