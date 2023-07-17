import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseService } from 'src/course/course.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionEntity } from './entities/section.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(SectionEntity)
    private readonly sectionRepository: Repository<SectionEntity>,

    private readonly courseService: CourseService,
  ) {}

  async findByOptions(options: FindOneOptions<SectionEntity>) {
    const section: SectionEntity | null = await this.sectionRepository.findOne(
      options,
    );

    return section;
  }

  async create(
    courseId: string,
    createSectionDto: CreateSectionDto,
    user: UserEntity,
  ) {
    const course = await this.courseService.findByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    await this.courseService.validateInstructor(courseId, user.id);

    return await this.sectionRepository.save({
      ...createSectionDto,
      fk_course_id: courseId,
    });
  }

  async update(
    courseId: string,
    sectionId: string,
    updateSectionDto: UpdateSectionDto,
    user: UserEntity,
  ) {
    const section = await this.findByOptions({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('해당 섹션이 존재하지 않습니다.');
    }

    await this.courseService.validateInstructor(courseId, user.id);

    Object.assign(section, updateSectionDto);

    return await this.sectionRepository.save(section);
  }

  async delete(courseId: string, sectionId: string, user: UserEntity) {
    const section = await this.findByOptions({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('해당 섹션이 존재하지 않습니다.');
    }

    await this.courseService.validateInstructor(courseId, user.id);

    const result = await this.sectionRepository.delete({ id: sectionId });

    return result.affected ? true : false;
  }
}
