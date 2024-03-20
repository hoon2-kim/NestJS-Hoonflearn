import { ERoleType } from '@src/user/enums/user.enum';
import { JwtPayload } from 'jsonwebtoken';

export interface IAuthToken {
  access_token: string;
  refresh_token: string;
}

export interface IGoogleUserInfo {
  user_id: string;
  name: string;
  email: string;
  provider: string;
  accessToken?: string;
}

export interface IJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: ERoleType;
}
