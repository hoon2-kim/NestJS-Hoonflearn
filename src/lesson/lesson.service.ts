import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseService } from 'src/course/course.service';
import { SectionService } from 'src/section/section.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonEntity } from './entities/lesson.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(LessonEntity)
    private readonly lessonRepository: Repository<LessonEntity>,

    private readonly sectionService: SectionService,
    private readonly courseService: CourseService,
  ) {}

  async findByOptions(
    options: FindOneOptions<LessonEntity>,
    transactionManager?: EntityManager,
  ) {
    let lesson: LessonEntity | null;

    if (transactionManager) {
      lesson = await transactionManager.findOne(LessonEntity, options);
    } else {
      lesson = await this.lessonRepository.findOne(options);
    }

    return lesson;
  }

  async create(createLessonDto: CreateLessonDto, user: UserEntity) {
    const { sectionId } = createLessonDto;

    const section = await this.sectionService.findByOptions({
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

    return lesson;
  }

  async update(
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
    user: UserEntity,
  ) {
    const lesson = await this.findByOptions({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('해당 수업이 존재하지 않습니다.');
    }

    const courseId = await this.getCourseIdByLessonIdWithQueryBuilder(lessonId);

    await this.courseService.validateInstructor(courseId, user.id);

    Object.assign(lesson, updateLessonDto);

    return await this.lessonRepository.save(lesson);
  }

  async delete(lessonId: string, user: UserEntity) {
    const lesson = await this.findByOptions({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('해당 수업이 존재하지 않습니다.');
    }

    const courseId = await this.getCourseIdByLessonIdWithQueryBuilder(lessonId);

    await this.courseService.validateInstructor(courseId, user.id);

    const result = await this.lessonRepository.delete({ id: lessonId });

    //TODO : 영상 삭제

    return result.affected ? true : false;
  }

  async getCourseIdByLessonIdWithQueryBuilder(
    lessonId: string,
    transactionManager?: EntityManager,
  ) {
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
