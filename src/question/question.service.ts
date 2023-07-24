import { NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseService } from 'src/course/course.service';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionEntity } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,

    private readonly courseService: CourseService,
  ) {}

  async findAll() {
    return `This action returns all question`;
  }

  async findAllByCourse(courseId: string) {
    // const course = await this.courseService.findByOptions({
    //   where: { id: courseId },
    // });

    // if (!course) {
    //   throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    // }

    const question = await this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.course', 'course')
      .where('course.id = :courseId', { courseId })
      .select([
        'question.id',
        'question.title',
        'question.commentCount',
        'course.id',
        'course.title',
      ])
      .getMany();

    return question;
  }

  async findOne(questionId: string) {
    return;
  }

  async findOneByOptions(options: FindOneOptions) {
    const question: QuestionEntity | null =
      await this.questionRepository.findOne(options);

    return question;
  }

  async create(createQuestionDto: CreateQuestionDto, userId: string) {
    const { courseId, ...qestion } = createQuestionDto;

    const course = await this.courseService.findByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    // 구매했는지

    const newQuestion = await this.questionRepository.save({
      ...qestion,
      fk_course_id: courseId,
      fk_user_id: userId,
    });

    return newQuestion;
  }

  async update(
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
    userId: string,
  ) {
    const question = await this.findOneByOptions({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('해당 질문글이 존재하지 않습니다.');
    }

    if (question.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 수정 가능합니다.');
    }

    Object.assign(question, updateQuestionDto);

    return await this.questionRepository.save(question);
  }

  async delete(questionId: string, userId: string) {
    const question = await this.findOneByOptions({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('해당 질문글이 존재하지 않습니다.');
    }

    if (question.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 삭제 가능합니다.');
    }

    const result = await this.questionRepository.delete({ id: questionId });

    return result.affected ? true : false;
  }
}
