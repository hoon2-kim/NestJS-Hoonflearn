import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { CourseService } from '@src/course/course.service';
import { CourseEntity } from '@src/course/entities/course.entity';
import { CourseUserService } from '@src/course_user/course-user.service';
import { SectionEntity } from '@src/section/entities/section.entity';
import { SectionService } from '@src/section/section.service';
import {
  DeleteResult,
  EntityManager,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { CreateLessonDto } from '@src/lesson/dtos/request/create-lesson.dto';
import { UpdateLessonDto } from '@src/lesson/dtos/request/update-lesson.dto';
import { LessonResponseDto } from '@src/lesson/dtos/response/lesson.response.dto';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { ELessonAction } from '@src/lesson/enums/lesson.enum';
import { UserEntity } from '@src/user/entities/user.entity';
import { ERoleType } from '@src/user/enums/user.enum';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(LessonEntity)
    private readonly lessonRepository: Repository<LessonEntity>,

    private readonly sectionService: SectionService,
    private readonly courseService: CourseService,
    private readonly courseUserService: CourseUserService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<LessonEntity>,
    manager?: EntityManager,
  ): Promise<LessonEntity | null> {
    let lesson: LessonEntity | null;

    manager
      ? (lesson = await manager.findOne(LessonEntity, options))
      : (lesson = await this.lessonRepository.findOne(options));

    return lesson;
  }

  async viewLesson(
    lessonId: string,
    user: UserEntity,
  ): Promise<LessonResponseDto> {
    const lesson = await this.findOneByOptions({
      where: { id: lessonId },
      relations: {
        video: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('해당 수업이 존재하지 않습니다.');
    }

    const courseId = await this.getCourseIdByLessonIdWithQueryBuilder(lessonId);

    // role이 유저면 해당 강의를 구매했는지
    if (user.role === ERoleType.User) {
      await this.courseUserService.validateBoughtCourseByUser(
        user.id,
        courseId,
      );
    } else if (user.role === ERoleType.Instructor) {
      // role이 지식공유자면 해당 강의를 만든 지식공유자면 통과
      try {
        await this.courseService.validateInstructor(courseId, user.id);
      } catch (e) {
        throw new ForbiddenException('해당 강의를 구매하지 않았습니다.');
      }
    }

    return LessonResponseDto.from(lesson);
  }

  async create(
    createLessonDto: CreateLessonDto,
    userId: string,
  ): Promise<LessonEntity> {
    const { sectionId } = createLessonDto;

    const section = await this.sectionService.findOneByOptions({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('해당 섹션이 존재하지 않습니다.');
    }

    const courseId = section.fk_course_id;

    await this.courseService.validateInstructor(courseId, userId);

    let lesson: LessonEntity;

    await this.lessonRepository.manager.transaction(async (manager) => {
      lesson = await manager.save(LessonEntity, {
        ...createLessonDto,
        fk_section_id: sectionId,
      });

      await this.sectionService.updateLessonCountInSection(
        sectionId,
        ELessonAction.Create,
        manager,
      );

      await this.courseService.updateTotalLessonCountInCourse(
        section?.fk_course_id,
        ELessonAction.Create,
        manager,
      );
    });

    return lesson;
  }

  async update(
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
    userId: string,
  ): Promise<void> {
    const lesson = await this.findOneByOptions({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('해당 수업이 존재하지 않습니다.');
    }

    const courseId = await this.getCourseIdByLessonIdWithQueryBuilder(lessonId);

    await this.courseService.validateInstructor(courseId, userId);

    Object.assign(lesson, updateLessonDto);

    await this.lessonRepository.save(lesson);
  }

  async delete(lessonId: string, userId: string): Promise<boolean> {
    const lesson = await this.findOneByOptions({
      where: { id: lessonId },
      relations: ['video'],
    });

    if (!lesson) {
      throw new NotFoundException('해당 수업이 존재하지 않습니다.');
    }

    const courseId = await this.getCourseIdByLessonIdWithQueryBuilder(lessonId);

    await this.courseService.validateInstructor(courseId, userId);

    let result: DeleteResult;

    await this.lessonRepository.manager.transaction(async (manager) => {
      await this.sectionService.updateLessonCountInSection(
        lesson.fk_section_id,
        ELessonAction.Delete,
        manager,
      );
      await this.courseService.updateTotalLessonCountInCourse(
        courseId,
        ELessonAction.Delete,
        manager,
      );

      if (lesson.video) {
        const url = lesson.video.videoUrl;
        const parsedUrl = new URL(url);
        const fileKey = decodeURIComponent(parsedUrl.pathname.substring(1));

        await this.awsS3Service.deleteS3Object(fileKey);
        await manager.decrement(
          SectionEntity,
          { id: lesson.fk_section_id },
          'totalSectionTime',
          lesson.video.videoTime,
        );
        await manager.decrement(
          CourseEntity,
          { id: courseId },
          'totalVideosTime',
          lesson.video.videoTime,
        );
      }

      result = await manager.delete(LessonEntity, { id: lessonId });
    });

    return result.affected ? true : false;
  }

  async getCourseIdByLessonIdWithQueryBuilder(
    lessonId: string,
    manager?: EntityManager,
  ): Promise<string> {
    let queryBuilder = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.section', 'section')
      .where('lesson.id = :lessonId', { lessonId })
      .select(['lesson.id', 'section.fk_course_id']);

    if (manager) {
      // 트랜잭션 범위 설정
      queryBuilder = queryBuilder.setQueryRunner(manager.queryRunner);
    }

    const lesson = await queryBuilder.getOne();

    return lesson.section.fk_course_id;
  }
}
