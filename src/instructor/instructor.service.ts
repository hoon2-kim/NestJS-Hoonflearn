import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { CreateInstructorDto } from './dtos/request/create-instructor.dto';
import { InstructorProfileEntity } from './entities/instructor-profile.entity';
import { Response } from 'express';
import { IInstructorCreateResult } from './interfaces/instructor.interface';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  InstructorCourseQueryDto,
  InstructorQuestionQueryDto,
  InstructorReviewQueryDto,
} from './dtos/query/instructor.query.dto';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { PageDto } from 'src/common/dtos/page.dto';
import { CourseService } from 'src/course/course.service';
import { QuestionService } from 'src/question/question.service';
import { ReviewService } from 'src/review/review.service';
import { ERoleType } from 'src/user/enums/user.enum';
import { CourseListByInstructorResponseDto } from 'src/course/dtos/response/course.response';
import { QuestionListResponseDto } from 'src/question/dtos/response/question.response.dto';
import { ReviewResponseWithoutCommentDto } from 'src/review/dtos/response/review.response.dto';

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
    user: UserEntity,
  ): Promise<PageDto<CourseListByInstructorResponseDto>> {
    const { take, skip } = instructorCourseQueryDto;

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

          return CourseListByInstructorResponseDto.from(course, questionCount);
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
    user: UserEntity,
  ): Promise<PageDto<QuestionListResponseDto>> {
    const courseIds = await this.courseService.getCourseIdsByInstructor(
      user.id,
    );

    return await this.questionService.findQuestionsByInstructorCourse(
      courseIds.getCourseIdsFlat,
      instructorQuestionQueryDto,
      user.id,
    );
  }

  async getReviewsByMyCourses(
    instructorReviewQueryDto: InstructorReviewQueryDto,
    user: UserEntity,
  ): Promise<PageDto<ReviewResponseWithoutCommentDto>> {
    const courseIds = await this.courseService.getCourseIdsByInstructor(
      user.id,
    );

    return await this.reviewService.findReviewsByInstructorCourse(
      courseIds.getCourseIdsFlat,
      instructorReviewQueryDto,
      user.id,
    );
  }

  async create(
    createInstructorDto: CreateInstructorDto,
    user: UserEntity,
    res: Response,
  ): Promise<IInstructorCreateResult> {
    const { contactEmail, nameOrBusiness, ...instructorInfo } =
      createInstructorDto;

    const isInstructor = await this.userService.findOneByOptions({
      where: { id: user.id, role: ERoleType.Instructor },
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
      ERoleType.Instructor,
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
}
