import { ERoleType } from '../enums/user.enum';

export interface ISimpleUserResponse {
  id: string;
  nickname: string;
  email: string;
  role: ERoleType;
}

export interface IUserResponse {
  id: string;
  nickname: string;
  email: string;
  profileAvatar: string;
  description: string;
  role: ERoleType;
  created_at: Date;
  updated_at: Date;
}
