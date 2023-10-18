import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateCourseDto } from '@src/course/dtos/request/create-course.dto';
import { UpdateCourseDto } from '@src/course/dtos/request/update-course.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { URL } from 'url';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { UserEntity } from '@src/user/entities/user.entity';
import { CategoryService } from '@src/category/category.service';
import { CategoryCourseService } from '@src/category_course/category_course.service';
import { CourseWishService } from '@src/course_wish/course_wish.service';
import { CourseListQueryDto } from '@src/course/dtos/query/course-list.query.dto';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import {
  ECourseChargeType,
  ECourseSortBy,
} from '@src/course/enums/course.enum';
import {
  CourseDashBoardResponseDto,
  CourseDetailResponseDto,
  CourseIdsReponseDto,
  CourseListResponseDto,
} from '@src/course/dtos/response/course.response';
import { EReviewMethod } from '@src/review/enums/review.enum';
import { CourseUserService } from '@src/course_user/course-user.service';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { ELessonAction } from '@src/lesson/enums/lesson.enum';
import { EOrderAction } from '@src/order/enums/order.enum';

const LESSON_UPDATE_VALUE_INCOURSE = 1;
const COURSE_STUDENTS_VALUE = 1;

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,

    private readonly categoryService: CategoryService,
    private readonly categoryCourseService: CategoryCourseService,
    private readonly courseWishService: CourseWishService,
    private readonly awsS3Service: AwsS3Service,
    private readonly dataSource: DataSource,
    private readonly courseUserService: CourseUserService,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<CourseEntity>,
    manager?: EntityManager,
  ): Promise<CourseEntity | null> {
    let course: CourseEntity | null;

    if (manager) {
      course = await manager.findOne(CourseEntity, options);
    } else {
      course = await this.courseRepository.findOne(options);
    }

    return course;
  }

  async findAllCourse(
    courseListQueryDto: CourseListQueryDto,
    mainCategoryId?: string | null,
    subCategoryId?: string | null,
  ): Promise<PageDto<CourseListResponseDto>> {
    const { take, skip, charge, level, s, sort } = courseListQueryDto;

    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .take(take)
      .skip(skip);

    if (mainCategoryId) {
      query
        .innerJoin('course.categoriesCourses', 'categoryCourse')
        .andWhere('categoryCourse.fk_parent_category_id = :mainCategoryId', {
          mainCategoryId,
        });

      if (subCategoryId) {
        query.andWhere('categoryCourse.fk_sub_category_id = :subCategoryId', {
          subCategoryId,
        });
      }
    }

    if (level) {
      query.andWhere('course.level = :level', { level });
    }

    if (s) {
      query.andWhere('LOWER(course.title) LIKE LOWER(:title)', {
        title: `%${s.toLowerCase()}%`,
      });
    }

    const CHARGE_MAPPING = {
      [ECourseChargeType.Free]: () =>
        query.andWhere('course.price = :price', { price: 0 }),
      [ECourseChargeType.Paid]: () =>
        query.andWhere('course.price <> :price', { price: 0 }),
    };

    CHARGE_MAPPING[charge]?.();

    // switch (charge) {
    //   case ECourseChargeType.Free:
    //     query.andWhere('course.price = :price', { price: 0 });
    //     break;

    //   case ECourseChargeType.Paid:
    //     query.andWhere('course.price <> :price', { price: 0 });
    //     break;
    // }

    switch (sort) {
      case ECourseSortBy.Wish:
        query
          .orderBy('course.wishCount', 'DESC')
          .addOrderBy('course.created_at', 'DESC');
        break;

      case ECourseSortBy.Rating:
        query
          .orderBy('course.averageRating', 'DESC')
          .addOrderBy('course.created_at', 'DESC');
        break;

      case ECourseSortBy.Popular:
        query
          .orderBy('course.students', 'DESC')
          .addOrderBy('course.created_at', 'DESC');
        break;

      case ECourseSortBy.Recent:
        query.orderBy('course.created_at', 'DESC');
        break;

      case ECourseSortBy.Old:
        query.orderBy('course.created_at', 'ASC');
        break;

      default:
        query.orderBy('course.created_at', 'DESC');
    }

    const [courses, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: courseListQueryDto,
      itemCount: count,
    });

    return new PageDto(
      courses.map((c) => CourseListResponseDto.from(c)),
      pageMeta,
    );
  }

  async findCourseDetail(courseId: string): Promise<CourseDetailResponseDto> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect(
        'course.categoriesCourses',
        'categories',
        'categories.isMain = true',
      )
      .leftJoinAndSelect('categories.parentCategory', 'pCategory')
      .leftJoinAndSelect('categories.subCategory', 'sCategory')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .leftJoinAndSelect('lesson.video', 'video')
      .where('course.id = :courseId', { courseId })
      .orderBy('section.created_at', 'ASC')
      .addOrderBy('lesson.created_at', 'ASC')
      .getOne();

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    return CourseDetailResponseDto.from(course);
  }

  async getStatusByUser(
    courseId: string,
    userId: string | null,
  ): Promise<{ isPurchased: boolean }> {
    console.log(userId);

    const isPurchased = userId
      ? await this.courseUserService.checkBoughtCourseByUser(userId, courseId)
      : false;

    return { isPurchased };
  }

  async getDashBoard(courseId: string, userId: string) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .leftJoinAndSelect('lesson.video', 'video')
      .where('course.id = :courseId', { courseId })
      .orderBy('section.created_at', 'ASC')
      .addOrderBy('lesson.created_at', 'ASC')
      .getOne();

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const questions = await this.questionRepository
      .createQueryBuilder('question')
      .where('question.fk_course_id = :courseId', { courseId })
      .orderBy('question.created_at', 'DESC')
      .limit(10)
      .getMany();

    course.questions = questions;

    await this.courseUserService.validateBoughtCourseByUser(userId, courseId);

    return CourseDashBoardResponseDto.from(course);
  }

  async create(
    createCourseDto: CreateCourseDto,
    user: UserEntity,
  ): Promise<CourseEntity> {
    const { title, selectedCategoryIds, ...info } = createCourseDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existCourse = await queryRunner.manager.findOne(CourseEntity, {
        where: { title },
      });

      if (existCourse) {
        throw new BadRequestException('같은 제목의 강의가 이미 존재합니다.');
      }

      // 카테고리 검증
      await this.categoryService.validateCategoryOptionalTransaction(
        selectedCategoryIds,
        queryRunner.manager,
      );

      const course = queryRunner.manager.create(CourseEntity, {
        title,
        ...info,
        instructor: user,
      });

      const result = await queryRunner.manager.save(CourseEntity, course);

      /** 강의 - 카테고리 중간테이블 저장 */
      await this.categoryCourseService.linkCourseToCategories(
        selectedCategoryIds,
        result.id,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    courseId: string,
    updateCourseDto: UpdateCourseDto,
    user: UserEntity,
  ): Promise<{ message: string }> {
    const { title, selectedCategoryIds } = updateCourseDto;

    const existCourse = await this.findOneByOptions({
      where: { id: courseId },
    });

    if (!existCourse) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    if (existCourse.fk_instructor_id !== user.id) {
      throw new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.');
    }

    if (title && existCourse.title !== title) {
      const existTitle = await this.findOneByOptions({
        where: { title },
      });

      if (existTitle) {
        throw new BadRequestException('같은 제목의 강의가 이미 존재합니다.');
      }
    }

    if (selectedCategoryIds) {
      await this.categoryService.validateCategoryOptionalTransaction(
        selectedCategoryIds,
      );

      await this.categoryCourseService.updateCourseToCategories(
        selectedCategoryIds,
        existCourse.id,
      );
    }

    Object.assign(existCourse, updateCourseDto);

    await this.courseRepository.save(existCourse);

    return { message: '수정 성공' };
  }

  async uploadImage(
    courseId: string,
    user: UserEntity,
    file: Express.Multer.File,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const course = await queryRunner.manager.findOne(CourseEntity, {
        where: { id: courseId },
      });

      if (!course) {
        throw new NotFoundException('해당 강의가 존재하지 않습니다.');
      }

      if (course.fk_instructor_id !== user.id) {
        throw new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.');
      }

      if (course.coverImage) {
        const url = course.coverImage;
        const parsedUrl = new URL(url);
        const fileKey = decodeURIComponent(parsedUrl.pathname.substring(1));

        await this.awsS3Service.deleteS3Object(fileKey);
      }

      const folderName = `유저-${user.id}/강의-${courseId}/coverImage`;

      const s3upload = await this.awsS3Service.uploadFileToS3(folderName, file);

      await queryRunner.manager.update(
        CourseEntity,
        { id: course.id },
        { coverImage: s3upload },
      );

      await queryRunner.commitTransaction();

      return s3upload;
    } catch (error) {
      console.log(error);

      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addOrCancelWish(courseId: string, userId: string): Promise<void> {
    const [wishLiked, course] = await Promise.all([
      this.isWishByUser(courseId, userId),
      this.findOneByOptions({ where: { id: courseId } }),
    ]);

    if (!course) {
      throw new NotFoundException(
        `해당 강의ID:${courseId}가 존재하지 않습니다.`,
      );
    }

    await this.courseWishService.toggleCourseWishStatus(
      courseId,
      userId,
      wishLiked,
    );
  }

  async isWishByUser(courseId: string, userId: string): Promise<boolean> {
    const isWish = await this.courseWishService.findOneByOptions({
      where: {
        fk_course_id: courseId,
        fk_user_id: userId,
      },
    });

    if (isWish) {
      return true;
    }

    return false;
  }

  async delete(courseId: string, user: UserEntity): Promise<boolean> {
    const course = await this.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    if (course.fk_instructor_id !== user.id) {
      throw new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.');
    }

    if (course.coverImage) {
      const url = course.coverImage;
      const parsedUrl = new URL(url);
      const fileKey = decodeURIComponent(parsedUrl.pathname.substring(1));

      await this.awsS3Service.deleteS3Object(fileKey);
    }

    //  영상도 삭제
    const video = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .leftJoinAndSelect('lesson.video', 'video')
      .where('course.id = :courseId', { courseId })
      .select(['video.videoUrl'])
      .getRawMany();

    const videoFilterToDelete = video.filter((v) => v.video_videoUrl !== null);

    await Promise.all(
      videoFilterToDelete.map(async (v) => {
        const url = v.video_videoUrl;
        const parsedUrl = new URL(url);
        const fileKey = decodeURIComponent(parsedUrl.pathname.substring(1));

        await this.awsS3Service.deleteS3Object(fileKey);
      }),
    );

    const result = await this.courseRepository.delete({ id: courseId });

    return result.affected ? true : false;
  }

  async validateInstructor(
    courseId: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const valid = await this.findOneByOptions(
      {
        where: {
          id: courseId,
          fk_instructor_id: userId,
        },
      },
      manager,
    );

    if (!valid) {
      throw new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.');
    }
  }

  async courseReviewRatingUpdate(
    course: CourseEntity,
    rating: number,
    method: EReviewMethod,
    manager?: EntityManager,
  ): Promise<void> {
    let updateValue = {};

    switch (method) {
      case EReviewMethod.Create:
        updateValue = {
          reviewCount: course.reviewCount + 1,
          averageRating: rating,
        };
        break;

      case EReviewMethod.Update:
        updateValue = {
          averageRating: rating,
        };
        break;

      case EReviewMethod.Delete:
        updateValue = {
          reviewCount: course.reviewCount - 1,
          averageRating: rating,
        };
        break;

      default:
        throw new BadRequestException('잘못된 enum값이 넘어왔습니다.');
    }

    manager
      ? await manager.update(CourseEntity, { id: course.id }, updateValue)
      : await this.courseRepository.update({ id: course.id }, updateValue);
  }

  async getCourseIdsByInstructor(userId: string): Promise<CourseIdsReponseDto> {
    const courses = await this.courseRepository.find({
      where: { fk_instructor_id: userId },
    });

    return CourseIdsReponseDto.from(courses);
  }

  async updateTotalLessonCountInCourse(
    courseId: string,
    action: ELessonAction,
    manager: EntityManager,
  ): Promise<void> {
    const course = await this.findOneByOptions({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundException('강의가 존재하지 않습니다.');
    }

    switch (action) {
      case ELessonAction.Create:
        await manager.increment(
          CourseEntity,
          { id: courseId },
          'totalLessonCount',
          LESSON_UPDATE_VALUE_INCOURSE,
        );
        break;

      case ELessonAction.Delete:
        await manager.decrement(
          CourseEntity,
          { id: courseId },
          'totalLessonCount',
          LESSON_UPDATE_VALUE_INCOURSE,
        );
        break;

      default:
        throw new BadRequestException('잘못된 enum값이 들어왔습니다.');
    }
  }

  async calculateCoursePriceInCart(courseIds: string[]): Promise<number> {
    const { result } = await this.courseRepository
      .createQueryBuilder('course')
      .whereInIds(courseIds)
      .select('SUM(course.price)', 'total')
      .getRawOne();

    return Number(result || 0);
  }

  async updateCourseStudents(
    courseIds: string[],
    action: EOrderAction,
    manager: EntityManager,
  ): Promise<void> {
    await Promise.all(
      courseIds.map(async (c) => {
        switch (action) {
          case EOrderAction.Create:
            await manager.increment(
              CourseEntity,
              { id: c },
              'students',
              COURSE_STUDENTS_VALUE,
            );
            break;

          case EOrderAction.Delete:
            await manager.decrement(
              CourseEntity,
              { id: c },
              'students',
              COURSE_STUDENTS_VALUE,
            );
            break;

          default:
            throw new BadRequestException(
              `잘못된 enum값:${action}이 들어왔습니다.`,
            );
        }
      }),
    );
  }
}
