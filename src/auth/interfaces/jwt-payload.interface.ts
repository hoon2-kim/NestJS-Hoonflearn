import { ERoleType } from 'src/user/enums/user.enum';

export interface JwtPayload {
  id: string;
  email: string;
  role: ERoleType;
}
