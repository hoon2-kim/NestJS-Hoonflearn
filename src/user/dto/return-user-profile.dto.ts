import { UserEntity } from '../entities/user.entity';

export class ReturnUserProfile {
  id: string;
  nickname: string;
  profileAvatar: string;
  email: string;
  description: string;
  phone: string;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.profileAvatar = user.profileAvatar;
    this.email = user.email;
    this.description = user.description;
    this.phone = user.phone;
  }
}
