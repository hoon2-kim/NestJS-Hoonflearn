import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AwsS3Service } from '../aws-s3/aws-s3.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly dataSource: DataSource,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async findByOptions(option: FindOneOptions<UserEntity>) {
    const user: UserEntity | null = await this.userRepository.findOne(option);

    return user;
  }

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

  async getProfile(user: UserEntity) {
    const profile = await this.findUserById(user.id);

    return profile;
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

  async upload(user: UserEntity, file: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const userInfo = await queryRunner.manager.findOne(UserEntity, {
        where: { id: user.id },
      });

      if (userInfo.profileAvatar) {
        const fileKey = userInfo.profileAvatar.match(/[^/]+$/)[0];
        console.log(fileKey);

        await this.awsS3Service.deleteS3Object(fileKey);
      }

      const folderName = `${user.id}/프로필이미지`;

      const s3upload = await this.awsS3Service.uploadFileToS3(folderName, file);

      await queryRunner.manager.update(
        UserEntity,
        { id: user.id },
        { profileAvatar: s3upload },
      );

      await queryRunner.commitTransaction();

      return s3upload;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(user: UserEntity) {
    const userInfo = await this.findUserById(user.id);

    const result = await this.userRepository.delete({ id: userInfo.id });

    return result.affected ? true : false;
  }

  async updateRefreshToken(userId: string, rt: string) {
    await this.userRepository.update({ id: userId }, { hashedRt: rt });
  }

  async removeRefreshToken(userId: string) {
    await this.userRepository.update({ id: userId }, { hashedRt: null });
  }
}
