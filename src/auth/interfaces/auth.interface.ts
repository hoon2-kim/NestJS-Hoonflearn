import { UserEntity } from 'src/user/entities/user.entity';

export interface IAuthLogin {
  access_token: string;
  user: UserEntity;
}

export interface IAuthRestore {
  access_token: string;
}
