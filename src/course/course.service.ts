import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateCourseDto } from './dtos/request/create-course.dto';
import { UpdateCourseDto } from './dtos/request/update-course.dto';
import { CourseEntity } from './entities/course.entity';
import { URL } from 'url';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { CategoryService } from 'src/category/category.service';
import { CategoryCourseService } from 'src/category_course/category_course.service';
import { CourseWishService } from 'src/course_wish/course_wish.service';
import { CourseListQueryDto } from './dtos/query/course-list.query.dto';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { PageDto } from 'src/common/dtos/page.dto';
import { ECourseChargeType, ECourseSortBy } from './enums/course.enum';
import {
  CourseDetailCourseInfoResponseDto,
  CourseDetailCurriculumResponseDto,
  CourseIdsReponseDto,
  CourseListResponseDto,
} from './dtos/response/course.response';
import { EReviewMethod } from 'src/review/enums/review.enum';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,

    private readonly categoryService: CategoryService,
    private readonly categoryCourseService: CategoryCourseService,
    private readonly courseWishService: CourseWishService,
    private readonly awsS3Service: AwsS3Service,
    private readonly dataSource: DataSource,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<CourseEntity>,
    transactionManager?: EntityManager,
  ): Promise<CourseEntity | null> {
    let course: CourseEntity | null;

    if (transactionManager) {
      course = await transactionManager.findOne(CourseEntity, options);
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
      query.innerJoin('course.categoriesCourses', 'categoryCourse');
      query.andWhere('categoryCourse.fk_parent_category_id = :mainCategoryId', {
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

    switch (charge) {
      case ECourseChargeType.Free:
        query.andWhere('course.price = :price', { price: 0 });
        break;

      case ECourseChargeType.Paid:
        query.andWhere('course.price <> :price', { price: 0 });
        break;
    }

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

  async findInfo(courseId: string): Promise<CourseDetailCourseInfoResponseDto> {
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
      .where('course.id = :courseId', { courseId })
      .getOne();

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    return CourseDetailCourseInfoResponseDto.from(course);
  }

  async findCurriculum(
    courseId: string,
  ): Promise<CourseDetailCurriculumResponseDto> {
    const curriculum = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .leftJoinAndSelect('lesson.video', 'video')
      .where('course.id = :courseId', { courseId })
      .orderBy('section.created_at', 'ASC')
      .addOrderBy('lesson.created_at', 'ASC')
      .getOne();

    if (!curriculum) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    return CourseDetailCurriculumResponseDto.from(curriculum);
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
      await this.categoryService.validateCategoryWithTransaction(
        selectedCategoryIds,
        queryRunner,
      );

      const course = queryRunner.manager.create(CourseEntity, {
        title,
        ...info,
        instructor: user,
      });

      const result = await queryRunner.manager.save(CourseEntity, course);

      await this.categoryCourseService.saveCategoryCourseRepo(
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
  ): Promise<void> {
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
      await this.categoryService.validateCategory(selectedCategoryIds);

      await this.categoryCourseService.saveCategoryCourseRepo(
        selectedCategoryIds,
        existCourse.id,
      );
    }

    Object.assign(existCourse, updateCourseDto);

    await this.courseRepository.save(existCourse);
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

  async addWish(courseId: string, user: UserEntity): Promise<void> {
    const existCourse = await this.findOneByOptions({
      where: { id: courseId },
    });

    if (!existCourse) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const isWished = await this.courseWishService.findOneByOptions({
      where: {
        fk_course_id: courseId,
        fk_user_id: user.id,
      },
    });

    if (!isWished) {
      await this.courseWishService.addWish(courseId, user.id);
      await this.courseRepository.update(
        { id: courseId },
        { wishCount: existCourse.wishCount + 1 },
      );
    } else {
      return;
    }
  }

  async cancelWish(courseId: string, user: UserEntity): Promise<void> {
    const existCourse = await this.findOneByOptions({
      where: { id: courseId },
    });

    if (!existCourse) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const isWished = await this.courseWishService.findOneByOptions({
      where: {
        fk_course_id: courseId,
        fk_user_id: user.id,
      },
    });

    if (isWished) {
      await this.courseWishService.cancelWish(courseId, user.id);
      await this.courseRepository.update(
        { id: courseId },
        { wishCount: existCourse.wishCount - 1 },
      );
    } else {
      return;
    }
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
    transactionManager?: EntityManager,
  ): Promise<void> {
    const valid = await this.findOneByOptions(
      {
        where: {
          id: courseId,
          fk_instructor_id: userId,
        },
      },
      transactionManager,
    );

    if (!valid) {
      throw new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.');
    }
  }

  async courseReviewRatingUpdate(
    course: CourseEntity,
    rating: number,
    method: EReviewMethod,
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
    }

    await this.courseRepository.update({ id: course.id }, updateValue);
  }

  async getCourseIdsByInstructor(userId: string): Promise<CourseIdsReponseDto> {
    const courses = await this.courseRepository.find({
      where: { fk_instructor_id: userId },
    });

    return CourseIdsReponseDto.from(courses);
  }

  async updateTotalLessonCountInCourse(
    courseId: string,
    isCreate: boolean,
  ): Promise<void> {
    const course = await this.findOneByOptions({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundException('강의가 존재하지 않습니다.');
    }

    isCreate
      ? await this.courseRepository.update(
          { id: courseId },
          { totalLessonCount: course.totalLessonCount + 1 },
        )
      : await this.courseRepository.update(
          { id: courseId },
          { totalLessonCount: course.totalLessonCount - 1 },
        );
  }

  async calculateCoursePriceInCart(courseIds: string[]): Promise<number> {
    const result = await this.courseRepository
      .createQueryBuilder('course')
      .whereInIds(courseIds)
      .select('SUM(course.price)', 'total')
      .getRawOne();

    return Number(result.total);
  }
}
