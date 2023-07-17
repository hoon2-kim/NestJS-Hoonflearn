import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseService } from 'src/course/course.service';
import { SectionService } from 'src/section/section.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
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

  async findByOptions(options: FindOneOptions<LessonEntity>) {
    const lesson: LessonEntity | null = await this.lessonRepository.findOne(
      options,
    );

    return lesson;
  }

  async create(
    courseId: string,
    createLessonDto: CreateLessonDto,
    user: UserEntity,
  ) {
    const { sectionId } = createLessonDto;

    const section = await this.sectionService.findByOptions({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('해당 섹션이 존재하지 않습니다.');
    }

    await this.courseService.validateInstructor(courseId, user.id);

    const lesson = await this.lessonRepository.save({
      ...createLessonDto,
      fk_section_id: sectionId,
    });

    return lesson;
  }

  async update(
    courseId: string,
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

    await this.courseService.validateInstructor(courseId, user.id);

    Object.assign(lesson, updateLessonDto);

    return await this.lessonRepository.save(lesson);
  }

  async delete(courseId: string, lessonId: string, user: UserEntity) {
    const lesson = await this.findByOptions({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('해당 수업이 존재하지 않습니다.');
    }

    await this.courseService.validateInstructor(courseId, user.id);

    const result = await this.lessonRepository.delete({ id: lessonId });

    return result.affected ? true : false;
  }
}
