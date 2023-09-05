import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/request/create-user.dto';
import { UpdateUserDto } from './dtos/request/update-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import {
  UserMyCourseQueryDto,
  UserQuestionQueryDto,
  UserWishQueryDto,
} from './dtos/query/user.query.dto';
import { CourseWishService } from 'src/course_wish/course_wish.service';
import { QuestionService } from 'src/question/question.service';
import { CourseUserService } from 'src/course_user/course-user.service';
import { ERoleType } from './enums/user.enum';
import { PageDto } from 'src/common/dtos/page.dto';
import { CourseUserListResponseDto } from 'src/course_user/dtos/response/course-user.response.dto';
import { CourseWishListResponseDto } from 'src/course_wish/dtos/response/course-wish.reponse.dto';
import { QuestionListResponseDto } from 'src/question/dtos/response/question.response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly dataSource: DataSource,
    private readonly awsS3Service: AwsS3Service,
    private readonly courseWishService: CourseWishService,
    private readonly questionService: QuestionService,
    private readonly courseUserService: CourseUserService,
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

  async getMyQuestions(
    userQuestionQueryDto: UserQuestionQueryDto,
    userId: string,
  ): Promise<PageDto<QuestionListResponseDto>> {
    return await this.questionService.findMyQuestions(
      userQuestionQueryDto,
      userId,
    );
  }

  async getWishCourses(
    userWishQueryDto: UserWishQueryDto,
    userId: string,
  ): Promise<PageDto<CourseWishListResponseDto>> {
    return await this.courseWishService.findWishCoursesByUser(
      userWishQueryDto,
      userId,
    );
  }

  async getMyCourses(
    userMyCourseQueryDto: UserMyCourseQueryDto,
    userId: string,
  ): Promise<PageDto<CourseUserListResponseDto>> {
    return await this.courseUserService.findMyCourses(
      userMyCourseQueryDto,
      userId,
    );
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { email, password, nickname, phone } = createUserDto;

    const isExistEmail = await this.findOneByOptions({
      where: { email },
    });

    if (isExistEmail) {
      throw new BadRequestException('해당하는 이메일이 이미 존재합니다.');
    }

    const isExistNickname = await this.findOneByOptions({
      where: { nickname },
    });

    if (isExistNickname) {
      throw new BadRequestException('닉네임이 이미 존재합니다.');
    }

    const isPhone = await this.findOneByOptions({
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

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<void> {
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
  }

  async upload(user: UserEntity, file: Express.Multer.File): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userInfo = await queryRunner.manager.findOne(UserEntity, {
        where: { id: user.id },
      });

      if (userInfo.profileAvatar) {
        const url = userInfo.profileAvatar;
        const parsedUrl = new URL(url);
        const fileKey = decodeURIComponent(parsedUrl.pathname.substring(1));

        await this.awsS3Service.deleteS3Object(fileKey);
      }

      const folderName = `유저-${user.id}/프로필이미지`;

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

  async delete(userId: string): Promise<boolean> {
    const user = await this.findOneByOptions({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    const result = await this.userRepository.delete({ id: userId });

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
