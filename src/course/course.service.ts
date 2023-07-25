import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { CourseEntity } from './entities/course.entity';
import { URL } from 'url';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { CategoryService } from 'src/category/category.service';
import { CategoryCourseService } from 'src/category_course/category_course.service';
import { CourseWishService } from 'src/course_wish/course_wish.service';

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

  async findOne(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: {
        categoriesCourses: true,
      },
    });

    return course;
  }

  async findOneByOptions(
    options: FindOneOptions<CourseEntity>,
    transactionManager?: EntityManager,
  ) {
    let course: CourseEntity | null;

    if (transactionManager) {
      course = await transactionManager.findOne(CourseEntity, options);
    } else {
      course = await this.courseRepository.findOne(options);
    }

    return course;
  }

  async findCurriculum(courseId: string) {
    const course = await this.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const curriculum = await this.findOneByOptions({
      where: { id: courseId },
      relations: {
        sections: {
          lessons: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return curriculum;
  }

  async create(
    createCourseDto: CreateCourseDto,
    user: UserEntity,
  ): Promise<CourseEntity> {
    const { title, selectedCategoryIds, ...info } = createCourseDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const existCourse = await queryRunner.manager.findOne(CourseEntity, {
        where: { title },
      });

      if (existCourse) {
        throw new BadRequestException('같은 제목의 강의가 이미 존재합니다.');
      }

      if (existCourse.fk_instructor_id !== user.id) {
        throw new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.');
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
      console.log(error);

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
  ) {
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

    return existCourse;
  }

  async uploadImage(
    courseId: string,
    user: UserEntity,
    file: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

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

  async addWish(courseId: string, user: UserEntity) {
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

  async cancelWish(courseId: string, user: UserEntity) {
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

  async delete(courseId: string, user: UserEntity) {
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

    // TODO 영상도 삭제

    const result = await this.courseRepository.delete({ id: courseId });

    return result.affected ? true : false;
  }

  async validateInstructor(
    courseId: string,
    userId: string,
    transactionManager?: EntityManager,
  ) {
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

  async courseReviewRatingUpdate(course: CourseEntity, rating: number) {
    await this.courseRepository.update(
      { id: course.id },
      { reviewCount: course.reviewCount + 1, averageRating: rating },
    );
  }
}
