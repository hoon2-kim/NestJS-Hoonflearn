import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseService } from '@src/course/course.service';
import { ELessonAction } from '@src/lesson/enums/lesson.enum';
import { UserEntity } from '@src/user/entities/user.entity';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateSectionDto } from '@src/section/dtos/request/create-section.dto';
import { UpdateSectionDto } from '@src/section/dtos/request/update-section.dto';
import { SectionEntity } from '@src/section/entities/section.entity';

const LESSON_UPDATE_VALUE_INSECTION = 1;

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(SectionEntity)
    private readonly sectionRepository: Repository<SectionEntity>,

    private readonly courseService: CourseService,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<SectionEntity>,
  ): Promise<SectionEntity | null> {
    const section: SectionEntity | null = await this.sectionRepository.findOne(
      options,
    );

    return section;
  }

  async create(
    createSectionDto: CreateSectionDto,
    user: UserEntity,
  ): Promise<SectionEntity> {
    const { courseId } = createSectionDto;

    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
      select: ['id', 'fk_instructor_id'],
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    if (course.fk_instructor_id !== user.id) {
      throw new ForbiddenException('해당 강의를 만든 지식공유자가 아닙니다.');
    }

    const section = await this.sectionRepository.save({
      ...createSectionDto,
      fk_course_id: courseId,
    });

    return section;
  }

  async update(
    sectionId: string,
    updateSectionDto: UpdateSectionDto,
    user: UserEntity,
  ): Promise<void> {
    const section = await this.findOneByOptions({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('해당 섹션이 존재하지 않습니다.');
    }

    await this.courseService.validateInstructor(section?.fk_course_id, user.id);

    Object.assign(section, updateSectionDto);

    await this.sectionRepository.save(section);
  }

  async delete(sectionId: string, user: UserEntity): Promise<boolean> {
    const section = await this.findOneByOptions({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('해당 섹션이 존재하지 않습니다.');
    }

    await this.courseService.validateInstructor(section?.fk_course_id, user.id);

    const result = await this.sectionRepository.delete({ id: sectionId });

    return result.affected ? true : false;
  }

  async updateLessonCountInSection(
    sectionId: string,
    action: ELessonAction,
    manager: EntityManager,
  ): Promise<void> {
    switch (action) {
      case ELessonAction.Create:
        await manager.increment(
          SectionEntity,
          { id: sectionId },
          'totalLessonBySectionCount',
          LESSON_UPDATE_VALUE_INSECTION,
        );
        break;

      case ELessonAction.Delete:
        await manager.decrement(
          SectionEntity,
          { id: sectionId },
          'totalLessonBySectionCount',
          LESSON_UPDATE_VALUE_INSECTION,
        );
        break;

      default:
        throw new BadRequestException('잘못된 enum값이 들어왔습니다.');
    }
  }
}
