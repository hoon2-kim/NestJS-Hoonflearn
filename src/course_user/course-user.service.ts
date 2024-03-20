import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { UserMyCourseQueryDto } from '@src/user/dtos/user.query.dto';
import {
  DeleteResult,
  EntityManager,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { CourseUserEntity } from '@src/course_user/entities/course-user.entity';
import { ECouresUserType } from '@src/course_user/enums/course-user.enum';

@Injectable()
export class CourseUserService {
  constructor(
    @InjectRepository(CourseUserEntity)
    private readonly courseUserRepository: Repository<CourseUserEntity>,
  ) {}

  async findMyCourses(
    userMyCourseQueryDto: UserMyCourseQueryDto,
    userId: string,
  ): Promise<PageDto<CourseUserEntity>> {
    const { s, take, skip } = userMyCourseQueryDto;

    const query = this.courseUserRepository
      .createQueryBuilder('courseUser')
      .leftJoinAndSelect('courseUser.course', 'course')
      .where('courseUser.fk_user_id = :userId', { userId })
      .take(take)
      .skip(skip)
      .orderBy('courseUser.created_at', 'DESC');

    if (s) {
      query.andWhere('LOWER(course.title) LIKE LOWER(:title)', {
        title: `%${s.toLowerCase()}%`,
      });
    }

    const [courses, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: userMyCourseQueryDto,
      itemCount: count,
    });

    return new PageDto(courses, pageMeta);
  }

  async saveCourseUserRepo(
    courseIds: string[],
    userId: string,
    manager?: EntityManager,
  ): Promise<CourseUserEntity[]> {
    const datas = courseIds.map((courseId) => {
      return manager
        ? manager.save(CourseUserEntity, {
            fk_course_id: courseId,
            fk_user_id: userId,
            type: ECouresUserType.Paid,
          })
        : this.courseUserRepository.save({
            fk_course_id: courseId,
            fk_user_id: userId,
            type: ECouresUserType.Paid,
          });
    });

    return await Promise.all(datas);
  }

  async saveFreeCourseUserRepo(
    courseId: string,
    userId: string,
    manager: EntityManager,
  ): Promise<CourseUserEntity> {
    return await manager.save(CourseUserEntity, {
      fk_course_id: courseId,
      fk_user_id: userId,
      type: ECouresUserType.Free,
    });
  }

  async cancelFreeCourseUserRepo(
    courseUserId: string,
    manager: EntityManager,
  ): Promise<DeleteResult> {
    return await manager.delete(CourseUserEntity, { id: courseUserId });
  }

  async validateBoughtCourseByUser(
    userId: string,
    courseId: string,
  ): Promise<void> {
    const valid = await this.courseUserRepository.findOne({
      where: {
        fk_course_id: courseId,
        fk_user_id: userId,
      },
    });

    if (!valid) {
      throw new ForbiddenException('해당 강의를 구매하지 않으셨습니다.');
    }
  }

  async checkBoughtCourseByUser(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    const check = await this.courseUserRepository.findOne({
      where: {
        fk_course_id: courseId,
        fk_user_id: userId,
      },
    });

    return !!check;
  }

  async findOneByOptions(
    options: FindOneOptions<CourseUserEntity>,
  ): Promise<CourseUserEntity | null> {
    const courseUser: CourseUserEntity | null =
      await this.courseUserRepository.findOne(options);

    return courseUser;
  }
}
