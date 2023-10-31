import { NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseService } from '@src/course/course.service';
import { CourseUserService } from '@src/course_user/course-user.service';
import { QuestionVoteService } from '@src/question-vote/question-vote.service';
import { UserQuestionQueryDto } from '@src/user/dtos/query/user.query.dto';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateQuestionDto } from '@src/question/dtos/request/create-question.dto';
import { QuestionListQueryDto } from '@src/question/dtos/query/question-list.query.dto';
import { QuestionStatusDto } from '@src/question/dtos/request/question-status.dto';
import { UpdateQuestionDto } from '@src/question/dtos/request/update-question.dto';
import { QuestionEntity } from '@src/question/entities/question.entity';
import {
  EQuestionSortBy,
  EQuestionStatus,
} from '@src/question/enums/question.enum';
import {
  QuestionDetailResponseDto,
  QuestionListResponseDto,
} from '@src/question/dtos/response/question.response.dto';
import { InstructorQuestionQueryDto } from '@src/instructor/dtos/query/instructor.query.dto';
import {
  EInstructorQuestionSortBy,
  EInstructorQuestionStatusBy,
} from '@src/instructor/enums/instructor.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionHitEvent } from '@src/question/events/question-hit.event';
import { QUESTION_HIT_EVENT } from '@src/question/listeners/question-hit.listener';
import { QuestionVoteDto } from '@src/question/dtos/request/question-vote.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,

    private readonly courseService: CourseService,
    private readonly questionVoteService: QuestionVoteService,
    private readonly courseUserService: CourseUserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    questionListQueryDto: QuestionListQueryDto,
  ): Promise<PageDto<QuestionListResponseDto>> {
    const { skip, take, status, s, sort } = questionListQueryDto;

    const query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .leftJoinAndSelect('question.course', 'course')
      .take(take)
      .skip(skip);

    if (status) {
      query.andWhere('question.questionStatus = :status', { status });
    }

    if (sort) {
      if (sort === EQuestionSortBy.Comment) {
        query.orderBy('question.commetCount', 'DESC');
      } else if (sort === EQuestionSortBy.Vote) {
        query
          .orderBy('question.voteCount', 'DESC')
          .addOrderBy('question.created_at', 'DESC');
      } else if (sort === EQuestionSortBy.Recent) {
        query.orderBy('question.created_at', 'DESC');
      } else if (sort === EQuestionSortBy.Old) {
        query.orderBy('question.created_at', 'ASC');
      }
    } else {
      query.orderBy('question.created_at', 'DESC');
    }

    if (s) {
      query.andWhere('LOWER(question.title) LIKE LOWER(:title)', {
        title: `%${s.toLowerCase()}%`,
      });
    }

    const [result, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: questionListQueryDto,
      itemCount: count,
    });

    return new PageDto(
      result.map((r) => QuestionListResponseDto.from(r)),
      pageMeta,
    );
  }

  async findAllByCourse(
    courseId: string,
    questionListQueryDto: QuestionListQueryDto,
  ): Promise<PageDto<QuestionListResponseDto>> {
    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const { skip, take, s } = questionListQueryDto;

    const query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.course', 'course')
      .leftJoinAndSelect('question.user', 'user')
      .where('course.id = :courseId', { courseId })
      .take(take)
      .skip(skip)
      .orderBy('question.created_at', 'DESC');

    if (s) {
      query.andWhere('LOWER(question.title) LIKE LOWER(:title)', {
        title: `%${s.toLowerCase()}%`,
      });
    }

    const [questions, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: questionListQueryDto,
      itemCount: count,
    });

    return new PageDto(
      questions.map((q) => QuestionListResponseDto.from(q)),
      pageMeta,
    );
  }

  async findOne(questionId: string): Promise<QuestionDetailResponseDto> {
    const question = await this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.course', 'course')
      .leftJoinAndSelect('question.user', 'user')
      .leftJoinAndSelect('question.questionComments', 'comment')
      .leftJoinAndSelect('comment.user', 'commentUser')
      .leftJoinAndSelect('comment.reComments', 're')
      .leftJoinAndSelect('re.user', 'reUser')
      .where('question.id = :questionId', { questionId })
      .andWhere(
        'comment.fk_question_id = :questionId AND comment.fk_question_comment_parentId IS NULL',
        { questionId },
      )
      .orderBy('comment.created_at', 'DESC')
      .addOrderBy('re.created_at', 'ASC')
      .getOne();

    if (!question) {
      throw new NotFoundException(
        `해당 ${questionId}의 질문글이 존재하지 않습니다.`,
      );
    }

    // 조회수 이벤트
    this.eventEmitter.emit(
      QUESTION_HIT_EVENT,
      new QuestionHitEvent(questionId),
    );

    return QuestionDetailResponseDto.from(question);
  }

  async findMyQuestions(
    userQuestionQueryDto: UserQuestionQueryDto,
    userId: string,
  ): Promise<PageDto<QuestionListResponseDto>> {
    const { take, skip, status } = userQuestionQueryDto;

    const query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .leftJoinAndSelect('question.course', 'course')
      .where('question.fk_user_id = :userId', { userId })
      .orderBy('question.created_at', 'DESC')
      .take(take)
      .skip(skip);

    switch (status) {
      case EQuestionStatus.Resolved:
        query.andWhere('question.questionStatus = :status', { status });
        break;

      case EQuestionStatus.UnResolved:
        query.andWhere('question.questionStatus = :status', { status });
        break;
    }

    const [questions, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: userQuestionQueryDto,
      itemCount: count,
    });

    return new PageDto(
      questions.map((q) => QuestionListResponseDto.from(q)),
      pageMeta,
    );
  }

  async findQuestionsByInstructorCourse(
    courseIds: string[],
    instructorQuestionQueryDto: InstructorQuestionQueryDto,
    userId: string,
  ): Promise<PageDto<QuestionListResponseDto>> {
    const { courseId, sort, status, skip, take } = instructorQuestionQueryDto;

    const query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.course', 'course')
      .leftJoinAndSelect('question.user', 'user')
      .take(take)
      .skip(skip);

    if (courseIds.length > 0) {
      query.where('question.fk_course_id IN (:...courseIds)', { courseIds });
    } else if (courseIds.length === 0) {
      // 강의를 안만든 강사의 경우 빈배열 반환
      query.where('1 = 0');
    }

    if (courseId) {
      query.andWhere('question.fk_course_id = :courseId', { courseId });
    }

    switch (sort) {
      case EInstructorQuestionSortBy.Recent:
        query.orderBy('question.created_at', 'DESC');
        break;

      case EInstructorQuestionSortBy.Old:
        query.orderBy('question.created_at', 'ASC');
        break;

      case EInstructorQuestionSortBy.Vote:
        query
          .orderBy('question.voteCount', 'DESC')
          .addOrderBy('question.created_at', 'DESC');
        break;

      case EInstructorQuestionSortBy.Comment_Recent:
        query
          .leftJoin(
            'question.questionComments',
            'comment',
            'comment.created_at = (SELECT MAX(created_at) FROM questions_comments WHERE fk_question_id = question.id)',
            // MAX로 여러개의 답변을 달았어도 제일 최신꺼로 가져온다.
          )
          .andWhere('comment.fk_user_id = :userId', { userId })
          .orderBy('comment.created_at', 'DESC');
        break;

      default:
        query.orderBy('question.created_at', 'DESC');
    }

    switch (status) {
      case EInstructorQuestionStatusBy.Resolved:
        query.andWhere('question.questionStatus = :status', { status });
        break;

      case EInstructorQuestionStatusBy.NotResolved:
        query.andWhere('question.questionStatus = :status', { status });
        break;

      case EInstructorQuestionStatusBy.Comment:
        query
          .leftJoin('question.questionComments', 'comment')
          .andWhere('comment.fk_user_id = :userId', { userId });
        break;

      case EInstructorQuestionStatusBy.NotComment:
        query
          .leftJoin('question.questionComments', 'comment')
          .andWhere('comment.fk_user_id != :userId', { userId });
        break;
    }

    const [questions, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: instructorQuestionQueryDto,
      itemCount: count,
    });

    return new PageDto(
      questions.map((q) => QuestionListResponseDto.from(q)),
      pageMeta,
    );
  }

  async findOneByOptions(
    options: FindOneOptions<QuestionEntity>,
  ): Promise<QuestionEntity | null> {
    const question: QuestionEntity | null =
      await this.questionRepository.findOne(options);

    return question;
  }

  async create(
    createQuestionDto: CreateQuestionDto,
    userId: string,
  ): Promise<QuestionEntity> {
    const { courseId, ...question } = createQuestionDto;

    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    // 구매했는지
    await this.courseUserService.validateBoughtCourseByUser(userId, courseId);

    const newQuestion = await this.questionRepository.save({
      ...question,
      fk_course_id: courseId,
      fk_user_id: userId,
    });

    return newQuestion;
  }

  async update(
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
    userId: string,
  ): Promise<{ message: string }> {
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

    await this.questionRepository.save(question);

    return { message: '수정 성공' };
  }

  async status(
    questionId: string,
    questionStatusDto: QuestionStatusDto,
    userId: string,
  ): Promise<void> {
    const { status } = questionStatusDto;

    const question = await this.findOneByOptions({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('해당 질문글이 존재하지 않습니다.');
    }

    if (question.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 리액션 가능합니다.');
    }

    if (status === question.questionStatus) {
      return;
    }

    if (status === EQuestionStatus.Resolved) {
      await this.questionRepository.update(
        { id: questionId },
        { questionStatus: EQuestionStatus.Resolved },
      );
    } else if (status === EQuestionStatus.UnResolved) {
      await this.questionRepository.update(
        { id: questionId },
        { questionStatus: EQuestionStatus.UnResolved },
      );
    }
  }

  async delete(questionId: string, userId: string): Promise<boolean> {
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

  async calculateQuestionCountByCourseId(courseId: string): Promise<number> {
    return await this.questionRepository.count({
      where: { fk_course_id: courseId },
    });
  }

  async updateVoteStatus(
    questionId: string,
    userId: string,
    questionVoteDto: QuestionVoteDto,
  ): Promise<void> {
    const { vote } = questionVoteDto;

    const question = await this.findOneByOptions({ where: { id: questionId } });

    if (!question) {
      throw new NotFoundException('해당 질문글이 존재하지 않습니다.');
    }

    await this.questionVoteService.handleVoteUpdate(questionId, userId, vote);
  }
}
