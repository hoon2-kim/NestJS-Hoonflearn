import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { CreateInstructorDto } from './dtos/create-instructor.dto';
import { UpdateInstructorDto } from './dtos/update-instructor.dto';
import { InstructorProfileEntity } from './entities/instructor-profile.entity';
import { Response } from 'express';
import { IInstructorCreateResult } from './interfaces/instructor.interface';
import { UserService } from 'src/user/user.service';
import { RoleType, UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(InstructorProfileEntity)
    private readonly instructorRepository: Repository<InstructorProfileEntity>,

    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async findOneById(instructorId: string) {
    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations: ['user'],
    });

    if (!instructor) {
      throw new NotFoundException('해당 지식공유자가 존재하지 않습니다.');
    }

    return instructor;
  }

  async findCourses(user: UserEntity) {
    //
  }

  async create(
    createInstructorDto: CreateInstructorDto,
    user: UserEntity,
    res: Response,
  ): Promise<IInstructorCreateResult> {
    const { contactEmail, nameOrBusiness, ...instructorInfo } =
      createInstructorDto;

    const isInstructor = await this.userService.findOneByOptions({
      where: { id: user.id, role: RoleType.Instructor },
    });

    if (isInstructor) {
      throw new BadRequestException('이미 지식공유자로 등록하셨습니다.');
    }

    const isExistEmail = await this.instructorRepository.findOne({
      where: { contactEmail },
    });

    if (isExistEmail) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const isExistNameOrBusiness = await this.instructorRepository.findOne({
      where: { nameOrBusiness },
    });

    if (isExistNameOrBusiness) {
      throw new BadRequestException(
        '이미 존재하는 지식공유자 실명 또는 사업체명 입니다.',
      );
    }

    const instructorProfile = this.instructorRepository.create({
      contactEmail,
      nameOrBusiness,
      ...instructorInfo,
      user: { id: user.id },
    });

    await this.instructorRepository.save(instructorProfile);

    const newAt = this.authService.getAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const newRt = this.authService.getRefreshToken(
      user.id,
      user.email,
      user.role,
    );

    const rtHash = await this.authService.hashData(newRt);

    await this.userService.updateRefreshToken(
      user.id,
      rtHash,
      RoleType.Instructor,
    );

    // await this.userRepository
    //   .createQueryBuilder('user')
    //   .update(UserEntity)
    //   .where('id = :userId', { userId: user.id })
    //   .set({ role: RoleType.Instructor, hashedRt: rtHash })
    //   .execute();

    res.cookie('refreshToken', newRt, {
      httpOnly: true,
      secure: false, // https 환경에서는 true
      sameSite: 'none',
      path: '/',
    });

    return {
      access_token: newAt,
      instructorProfile,
    };
  }

  async update(instructorId: string, updateInstructorDto: UpdateInstructorDto) {
    const { contactEmail, nameOrBusiness } = updateInstructorDto;

    const instructor = await this.findOneById(instructorId);

    if (contactEmail) {
      const isExistEmail = await this.instructorRepository.findOne({
        where: { contactEmail },
      });

      if (isExistEmail && contactEmail !== instructor.contactEmail) {
        throw new BadRequestException('이미 존재하는 이메일입니다.');
      }
    }

    if (nameOrBusiness) {
      const isExistNameOrBusiness = await this.instructorRepository.findOne({
        where: { nameOrBusiness },
      });

      if (
        isExistNameOrBusiness &&
        nameOrBusiness !== instructor.nameOrBusiness
      ) {
        throw new BadRequestException(
          '이미 존재하는 지식공유자 실명 또는 사업체명 입니다.',
        );
      }
    }

    Object.assign(instructor, updateInstructorDto);

    return await this.instructorRepository.save(instructor);
  }
}
