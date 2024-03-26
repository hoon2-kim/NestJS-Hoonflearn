import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import {
  CreateUserDto,
  NicknameDto,
  PhoneCheckDto,
  PhoneDto,
} from '@src/user/dtos/create-user.dto';
import { UpdateUserDto } from '@src/user/dtos/update-user.dto';
import { UserEntity } from '@src/user/entities/user.entity';
import * as bcryptjs from 'bcryptjs';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { CartService } from '@src/cart/cart.service';
import { CoolsmsService } from '@src/coolsms/coolsms.service';
import { RedisService } from '@src/redis/redis.service';
import { createRandomToken } from '@src/common/utils/randomToken';
import { coolsmsUserPhoneKey } from '@src/redis/keys';
import { IJwtPayload } from '@src/auth/interfaces/auth.interface';
import { ERoleType } from './enums/user.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(InstructorProfileEntity)
    private readonly instructorProfileRepository: Repository<InstructorProfileEntity>,

    private readonly dataSource: DataSource,
    private readonly awsS3Service: AwsS3Service,
    private readonly cartService: CartService,
    private readonly coolsmsService: CoolsmsService,
    private readonly redisService: RedisService,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<UserEntity>,
  ): Promise<UserEntity | null> {
    const user: UserEntity | null = await this.userRepository.findOne(options);

    return user;
  }

  async getProfile(userId: string): Promise<UserEntity> {
    const profile = await this.findOneByOptions({
      where: { id: userId },
    });

    return profile;
  }

  async create(
    createUserDto: CreateUserDto,
    provider?: string,
  ): Promise<UserEntity> {
    const { email, password, nickname } = createUserDto;

    const hashedPassword = await bcryptjs.hash(password, 10);

    try {
      const result = await this.userRepository.save({
        email,
        nickname,
        password: hashedPassword,
        loginType: provider,
      });

      return result;
    } catch (error) {
      if (error.code === '23505') {
        if (error.detail.includes('email')) {
          throw new BadRequestException('해당하는 이메일이 이미 존재합니다.');
        }

        throw new BadRequestException(error.detail);
      } else {
        throw new InternalServerErrorException('서버 오류');
      }
    }
  }

  async checkNick(nickNameDto: NicknameDto): Promise<void> {
    const check = await this.findOneByOptions({
      where: { nickname: nickNameDto.nickname },
    });

    if (check) {
      throw new BadRequestException('해당 닉네임은 이미 사용중입니다.');
    }

    return;
  }

  async sendSMS(phoneDto: PhoneDto): Promise<void> {
    const token = createRandomToken();

    await Promise.all([
      this.coolsmsService.sendSMS(phoneDto.phone, token),
      this.redisService.set(coolsmsUserPhoneKey(phoneDto.phone), token, 180),
    ]);
  }

  async checkToken(id: string, phoneCheckDto: PhoneCheckDto) {
    const savedToken = await this.redisService.get(
      coolsmsUserPhoneKey(phoneCheckDto.phone),
    );

    if (!savedToken) {
      throw new BadRequestException('인증번호를 먼저 요청해주세요.');
    }

    if (savedToken !== phoneCheckDto.token) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.');
    }

    await this.userRepository.update({ id }, { phone: phoneCheckDto.phone });
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const { nickname } = updateUserDto;

    const user = await this.findOneByOptions({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

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

  async upload(userId: string, file: Express.Multer.File): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userInfo = await queryRunner.manager.findOne(UserEntity, {
        where: { id: userId },
      });

      const folderName = `유저-${userId}/프로필이미지`;

      const s3upload = await this.awsS3Service.uploadFileToS3(folderName, file);

      if (userInfo.profileAvatar) {
        const url = userInfo.profileAvatar;
        const parsedUrl = new URL(url);
        const fileKey = decodeURIComponent(parsedUrl.pathname.substring(1));

        await this.awsS3Service.deleteS3Object(fileKey);
      }

      await queryRunner.manager.update(
        UserEntity,
        { id: userId },
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

  async delete(user: IJwtPayload): Promise<void> {
    const { id, role } = user;

    const existUser = await this.findOneByOptions({
      where: { id },
    });

    if (!existUser) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    if (role === ERoleType.Instructor) {
      await this.instructorProfileRepository.softDelete({
        fk_user_id: id,
      });
    }

    /** 장바구니 삭제 */
    await this.cartService.removeCart(id);

    await this.userRepository.softDelete({ id });
  }
}
