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
import { CustomRedisService } from '@src/redis/redis.service';
import { jwtRefreshTokenKey } from '@src/redis/keys';
import { CourseEntity } from '@src/course/entities/course.entity';
import { QuestionEntity } from '@src/question/entities/question.entity';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(InstructorProfileEntity)
    private readonly instructorRepository: Repository<InstructorProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,

    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly courseService: CourseService,
    private readonly questionService: QuestionService,
    private readonly reviewService: ReviewService,
    private readonly redisService: CustomRedisService,
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
  ): Promise<PageDto<CourseEntity>> {
    const { take, skip } = instructorCourseQueryDto;

    const [datas, count] = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.fk_instructor_id = :instructorId', {
        instructorId: user.id,
      })
      .take(take)
      .skip(skip)
      .orderBy('course.created_at', 'DESC')
      .getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: instructorCourseQueryDto,
      itemCount: count,
    });

    return new PageDto(datas, pageMeta);
  }

  async getQuestionsByMyCourses(
    instructorQuestionQueryDto: InstructorQuestionQueryDto,
    user: IJwtPayload,
  ): Promise<PageDto<QuestionEntity>> {
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
