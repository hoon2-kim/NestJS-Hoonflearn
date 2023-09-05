import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { PageDto } from 'src/common/dtos/page.dto';
import { ECourseChargeType } from 'src/course/enums/course.enum';
import { UserWishQueryDto } from 'src/user/dtos/query/user.query.dto';
import { EUserWishCourseSort } from 'src/user/enums/user.enum';
import { FindOneOptions, Repository } from 'typeorm';
import { CourseWishListResponseDto } from './dtos/response/course-wish.reponse.dto';
import { CourseWishEntity } from './entities/course-wish.entity';

@Injectable()
export class CourseWishService {
  constructor(
    @InjectRepository(CourseWishEntity)
    private readonly courseWishRepository: Repository<CourseWishEntity>,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<CourseWishEntity>,
  ): Promise<CourseWishEntity | null> {
    const courseWish: CourseWishEntity | null =
      await this.courseWishRepository.findOne(options);

    return courseWish;
  }

  async findWishCoursesByUser(
    userWishQueryDto: UserWishQueryDto,
    userId: string,
  ): Promise<PageDto<CourseWishListResponseDto>> {
    const { take, skip, sort, charge } = userWishQueryDto;

    const query = this.courseWishRepository
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('wish.fk_user_id = :userId', { userId })
      .take(take)
      .skip(skip);

    switch (charge) {
      case ECourseChargeType.Free:
        query.andWhere('course.price = :price', { price: 0 });
        break;

      case ECourseChargeType.Paid:
        query.andWhere('course.price <> :price', { price: 0 });
        break;
    }

    switch (sort) {
      case EUserWishCourseSort.Recent:
        query.orderBy('wish.created_at', 'DESC');
        break;

      case EUserWishCourseSort.Title:
        query.orderBy('course.title', 'ASC');
        break;

      case EUserWishCourseSort.Rating:
        query
          .orderBy('course.averageRating', 'DESC')
          .addOrderBy('course.created_at', 'DESC');
        break;

      case EUserWishCourseSort.Student:
        query.orderBy('course.students', 'DESC');
        break;

      default:
        query.orderBy('wish.created_at', 'DESC');
        break;
    }

    const [wishs, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: userWishQueryDto,
      itemCount: count,
    });

    return new PageDto(
      wishs.map((w) => CourseWishListResponseDto.from(w)),
      pageMeta,
    );
  }

  async addWish(courseId: string, userId: string): Promise<void> {
    await this.courseWishRepository.save({
      fk_course_id: courseId,
      fk_user_id: userId,
    });
  }

  async cancelWish(courseId: string, userId: string): Promise<void> {
    await this.courseWishRepository.delete({
      fk_course_id: courseId,
      fk_user_id: userId,
    });
  }
}
