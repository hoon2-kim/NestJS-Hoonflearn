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
} from '@src/user/dtos/request/create-user.dto';
import { UpdateUserDto } from '@src/user/dtos/request/update-user.dto';
import { UserEntity } from '@src/user/entities/user.entity';
import * as bcryptjs from 'bcryptjs';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { ERoleType } from '@src/user/enums/user.enum';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { CartService } from '@src/cart/cart.service';

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

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { email, password, nickname, phone } = createUserDto;

    const hashedPassword = await bcryptjs.hash(password, 10);

    try {
      const result = await this.userRepository.save({
        email,
        phone,
        nickname,
        password: hashedPassword,
      });

      return result;
    } catch (error) {
      if (error.code === '23505') {
        if (error.detail.includes('email')) {
          throw new BadRequestException('해당하는 이메일이 이미 존재합니다.');
        }

        if (error.detail.includes('phone')) {
          throw new BadRequestException('핸드폰 번호가 이미 존재합니다.');
        }
        throw new BadRequestException(error.detail);
      } else {
        throw new InternalServerErrorException('서버 오류');
      }
    }
  }

  async checkNick(nickNameDto: NicknameDto): Promise<{ message: string }> {
    const check = await this.findOneByOptions({
      where: { nickname: nickNameDto.nickname },
    });

    if (check) {
      throw new BadRequestException('해당 닉네임은 이미 사용중입니다.');
    }

    return { message: `해당 닉네임:${nickNameDto.nickname}은 사용가능합니다.` };
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string }> {
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

    await this.userRepository.save(user);

    return { message: '수정 성공' };
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

  async delete(userId: string): Promise<boolean> {
    const user = await this.findOneByOptions({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    const result = await this.userRepository.softDelete({ id: userId });

    const instructorProfile = await this.instructorProfileRepository.findOne({
      where: { fk_user_id: userId },
    });

    if (instructorProfile) {
      await this.instructorProfileRepository.softDelete({
        id: instructorProfile.id,
      });
    }

    /** 장바구니 삭제 */
    await this.cartService.removeCart(userId);

    return result.affected ? true : false;
  }

  async updateRefreshToken(
    userId: string,
    rt: string,
    roleType?: ERoleType.Instructor,
  ): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { hashedRt: rt, role: roleType },
    );
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.userRepository.update({ id: userId }, { hashedRt: null });
  }
}
