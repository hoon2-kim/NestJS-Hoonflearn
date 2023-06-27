import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return user;
  }

  async findUserByEmail(userEmail: string) {
    const user = await this.userRepository.findOne({
      where: { email: userEmail },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, nickname, phone } = createUserDto;

    const isExistEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (isExistEmail) {
      throw new BadRequestException('해당하는 이메일이 이미 존재합니다.');
    }

    const isExistNickname = await this.userRepository.findOne({
      where: { nickname },
    });

    if (isExistNickname) {
      throw new BadRequestException('닉네임이 이미 존재합니다.');
    }

    const isPhone = await this.userRepository.findOne({
      where: { phone },
    });

    if (isPhone) {
      throw new BadRequestException('핸드폰 번호가 이미 존재합니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = this.userRepository.create({
      email,
      phone,
      nickname,
      password: hashedPassword,
    });

    await this.userRepository.save(result);

    return result;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const { nickname } = updateUserDto;

    const user = await this.findUserById(userId);

    if (nickname && user.nickname !== nickname) {
      const isExistNickname = await this.userRepository.findOne({
        where: { nickname },
      });

      if (isExistNickname) {
        throw new BadRequestException('이미 존재하는 닉네임 입니다.');
      }
    }

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }
}
