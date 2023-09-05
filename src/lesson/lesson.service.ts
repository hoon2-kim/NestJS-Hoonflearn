import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseService } from 'src/course/course.service';
import { SectionService } from 'src/section/section.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateLessonDto } from './dtos/request/create-lesson.dto';
import { UpdateLessonDto } from './dtos/request/update-lesson.dto';
import { LessonEntity } from './entities/lesson.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(LessonEntity)
    private readonly lessonRepository: Repository<LessonEntity>,

    private readonly sectionService: SectionService,
    private readonly courseService: CourseService,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<LessonEntity>,
    transactionManager?: EntityManager,
  ): Promise<LessonEntity | null> {
    let lesson: LessonEntity | null;

    transactionManager
      ? (lesson = await transactionManager.findOne(LessonEntity, options))
      : (lesson = await this.lessonRepository.findOne(options));

    // if (transactionManager) {
    //   lesson = await transactionManager.findOne(LessonEntity, options);
    // } else {
    //   lesson = await this.lessonRepository.findOne(options);
    // }

    return lesson;
  }

  async create(
    createLessonDto: CreateLessonDto,
    user: UserEntity,
  ): Promise<LessonEntity> {
    const { sectionId } = createLessonDto;

    const section = await this.sectionService.findOneByOptions({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('해당 섹션이 존재하지 않습니다.');
    }

    const courseId =
      await this.sectionService.getCourseIdBySectionIdWithQueryBuilder(
        sectionId,
      );

    await this.courseService.validateInstructor(courseId, user.id);

    const lesson = await this.lessonRepository.save({
      ...createLessonDto,
      fk_section_id: sectionId,
    });

    await this.sectionService.updateLessonCountInSection(sectionId, true);
    await this.courseService.updateTotalLessonCountInCourse(
      section.fk_course_id,
      true,
    );

    return lesson;
  }

  async update(
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
    user: UserEntity,
  ): Promise<void> {
    const lesson = await this.findOneByOptions({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('해당 수업이 존재하지 않습니다.');
    }

    const courseId = await this.getCourseIdByLessonIdWithQueryBuilder(lessonId);

    await this.courseService.validateInstructor(courseId, user.id);

    Object.assign(lesson, updateLessonDto);

    await this.lessonRepository.save(lesson);
  }

  async delete(lessonId: string, user: UserEntity): Promise<boolean> {
    const lesson = await this.findOneByOptions({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('해당 수업이 존재하지 않습니다.');
    }

    const courseId = await this.getCourseIdByLessonIdWithQueryBuilder(lessonId);

    await this.courseService.validateInstructor(courseId, user.id);

    const updateLessonCount =
      await this.sectionService.updateLessonCountInSection(
        lesson.fk_section_id,
        false,
      );
    await this.courseService.updateTotalLessonCountInCourse(
      updateLessonCount.fk_course_id,
      false,
    );

    const result = await this.lessonRepository.delete({ id: lessonId });

    //TODO : 영상 삭제

    return result.affected ? true : false;
  }

  async getCourseIdByLessonIdWithQueryBuilder(
    lessonId: string,
    transactionManager?: EntityManager,
  ): Promise<string> {
    let queryBuilder = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.section', 'section')
      .where('lesson.id = :lessonId', { lessonId })
      .select(['lesson.id', 'section.fk_course_id']);

    if (transactionManager) {
      // 트랜잭션 범위 설정
      queryBuilder = queryBuilder.setQueryRunner(
        transactionManager.queryRunner,
      );
    }

    const lesson = await queryBuilder.getOne();

    return lesson?.section?.fk_course_id;
  }
}
