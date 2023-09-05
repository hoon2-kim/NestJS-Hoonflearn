import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { PageDto } from 'src/common/dtos/page.dto';
import { UserMyCourseQueryDto } from 'src/user/dtos/query/user.query.dto';
import {
  DeleteResult,
  EntityManager,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { CourseUserListResponseDto } from './dtos/response/course-user.response.dto';
import { CourseUserEntity } from './entities/course-user.entity';
import { ECouresUserType } from './enums/course-user.enum';

@Injectable()
export class CourseUserService {
  constructor(
    @InjectRepository(CourseUserEntity)
    private readonly courseUserRepository: Repository<CourseUserEntity>,
  ) {}

  async findMyCourses(
    userMyCourseQueryDto: UserMyCourseQueryDto,
    userId: string,
  ): Promise<PageDto<CourseUserListResponseDto>> {
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

    return new PageDto(
      courses.map((c) => CourseUserListResponseDto.from(c)),
      pageMeta,
    );
  }

  async saveCourseUserRepo(
    courseIds: string[],
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const datas = courseIds.map((courseId) => {
      return transactionManager
        ? transactionManager.save(CourseUserEntity, {
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

    await Promise.all(datas);
  }

  async saveFreeCourseUserRepo(
    courseId: string,
    userId: string,
  ): Promise<CourseUserEntity> {
    return await this.courseUserRepository.save({
      fk_course_id: courseId,
      fk_user_id: userId,
      type: ECouresUserType.Free,
    });
  }

  async cancelFreeCourseUserRepo(courseUserId: string): Promise<DeleteResult> {
    return await this.courseUserRepository.delete({ id: courseUserId });
  }

  async validateBoughtCourseByUser(
    userId: string,
    courseId: string,
  ): Promise<CourseUserEntity> {
    const valid = await this.courseUserRepository.findOne({
      where: {
        fk_course_id: courseId,
        fk_user_id: userId,
      },
    });

    if (!valid) {
      throw new ForbiddenException('해당 강의를 구매하지 않으셨습니다.');
    }

    return valid;
  }

  async findOneByOptions(
    options: FindOneOptions<CourseUserEntity>,
  ): Promise<CourseUserEntity | null> {
    const courseUser: CourseUserEntity | null =
      await this.courseUserRepository.findOne(options);

    return courseUser;
  }
}
