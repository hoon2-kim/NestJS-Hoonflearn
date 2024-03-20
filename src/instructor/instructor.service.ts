import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '@src/auth/auth.service';
import { Repository } from 'typeorm';
import { CreateInstructorDto } from '@src/instructor/dtos/create-instructor.dto';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { Response } from 'express';
import { IAuthToken, IJwtPayload } from '@src/auth/interfaces/auth.interface';
import { UserService } from '@src/user/user.service';
import { UserEntity } from '@src/user/entities/user.entity';
import {
  InstructorCourseQueryDto,
  InstructorQuestionQueryDto,
  InstructorReviewQueryDto,
} from '@src/instructor/dtos/instructor.query.dto';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseService } from '@src/course/course.service';
import { QuestionService } from '@src/question/question.service';
import { ReviewService } from '@src/review/review.service';
import { ERoleType } from '@src/user/enums/user.enum';
import { RedisService } from '@src/redis/redis.service';
import { jwtRefreshTokenKey } from '@src/redis/keys';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(InstructorProfileEntity)
    private readonly instructorRepository: Repository<InstructorProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly courseService: CourseService,
    private readonly questionService: QuestionService,
    private readonly reviewService: ReviewService,
    private readonly redisService: RedisService,
  ) {}

  async findOneById(instructorId: string): Promise<InstructorProfileEntity> {
    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations: ['user'],
    });

    if (!instructor) {
      throw new NotFoundException('해당 지식공유자가 존재하지 않습니다.');
    }

    return instructor;
  }

  async getMyCoursesByInstructor(
    instructorCourseQueryDto: InstructorCourseQueryDto,
    user: IJwtPayload,
  ): Promise<PageDto<any>> {
    const { take, skip } = instructorCourseQueryDto;

    // 다시 최적화하기
    const datas = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.madeCourses', 'course')
      .leftJoin('user.questions', 'question')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('user.role = :role', { role: ERoleType.Instructor })
      .take(take)
      .skip(skip)
      .orderBy('course.created_at', 'DESC')
      .getMany();

    const responseData = await Promise.all(
      datas.flatMap((user) =>
        user.madeCourses?.map(async (course) => {
          const questionCount =
            await this.questionService.calculateQuestionCountByCourseId(
              course.id,
            );

          return course;
        }),
      ),
    );

    const pageMeta = new PageMetaDto({
      pageOptionDto: instructorCourseQueryDto,
      itemCount: responseData.length,
    });

    return new PageDto(responseData, pageMeta);
  }

  async getQuestionsByMyCourses(
    instructorQuestionQueryDto: InstructorQuestionQueryDto,
    user: IJwtPayload,
  ): Promise<PageDto<any>> {
    const courseIds = await this.courseService.getCourseIdsByInstructor(
      user.id,
    );

    return await this.questionService.findQuestionsByInstructorCourse(
      courseIds,
      instructorQuestionQueryDto,
      user.id,
    );
  }

  async getReviewsByMyCourses(
    instructorReviewQueryDto: InstructorReviewQueryDto,
    user: IJwtPayload,
  ): Promise<PageDto<any>> {
    const courseIds = await this.courseService.getCourseIdsByInstructor(
      user.id,
    );

    return await this.reviewService.findReviewsByInstructorCourse(
      courseIds,
      instructorReviewQueryDto,
      user.id,
    );
  }

  async create(
    createInstructorDto: CreateInstructorDto,
    user: IJwtPayload,
    res: Response,
  ): Promise<IAuthToken> {
    const { contactEmail, nameOrBusiness, ...instructorInfo } =
      createInstructorDto;

    const isInstructor = await this.userService.findOneByOptions({
      where: { id: user.id, role: ERoleType.Instructor },
    });

    if (isInstructor) {
      throw new BadRequestException('이미 지식공유자로 등록하셨습니다.');
    }

    try {
      await this.instructorRepository.save({
        contactEmail,
        nameOrBusiness,
        ...instructorInfo,
        user: { id: user.id },
      });

      await this.userRepository.update(
        { id: user.id },
        { role: ERoleType.Instructor },
      );

      const tokens = await this.authService.getJwtTokens({
        id: user.id,
        email: user.email,
        role: ERoleType.Instructor,
      });

      res.cookie('refreshToken', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development' ? false : true, // https 환경에서는 true
        sameSite: 'none',
        path: '/',
        maxAge: parseInt(process.env.JWT_RT_COOKIE_MAX_AGE),
      });

      const ttl = +process.env.JWT_RT_SECONDS;
      await this.redisService.set(
        jwtRefreshTokenKey(user.email),
        tokens.refresh_token,
        ttl,
      );

      return tokens;
    } catch (error) {
      if (error.code === '23505') {
        if (error.detail.includes('contactEmail')) {
          throw new BadRequestException(
            '이미 존재하는 지식공유자 이메일입니다.',
          );
        }

        if (error.detail.includes('nameOrBusiness')) {
          throw new BadRequestException(
            '이미 존재하는 지식공유자 실명 또는 사업체명입니다.',
          );
        }

        throw new BadRequestException(error.detail);
      } else {
        throw new InternalServerErrorException('서버 오류');
      }
    }
  }
}
