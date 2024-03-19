import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from '@src/question/question.service';
import { Repository } from 'typeorm';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { CourseService } from '@src/course/course.service';
import { QuestionVoteService } from '@src/question/question-vote/question-vote.service';
import { CourseUserService } from '@src/course_user/course-user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  expectedMyQuestionWithoutComment,
  expectedQuestionDetail,
  expectedQuestionWithoutComment,
  mockCourseService,
  mockCourseUserService,
  mockCreatedQuestion,
  mockCreateQuestionDto,
  mockEventEmitter2,
  mockQuestionRepository,
  mockQuestionsWithOutComment,
  mockQuestionVoteService,
  mockQuestionWithComment,
  mockUpdateQuestionDto,
} from '@test/__mocks__/question.mock';
import { QuestionListQueryDto } from '@src/question/dtos/question-list.query.dto';
import {
  EQuestionSortBy,
  EQuestionStatus,
} from '@src/question/enums/question.enum';
import { mockCreatedCourse } from '@test/__mocks__/course.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { QuestionHitEvent } from '@src/question/events/question-hit.event';
import { UserQuestionQueryDto } from '@src/user/dtos/user.query.dto';
import { InstructorQuestionQueryDto } from '@src/instructor/dtos/instructor.query.dto';
import {
  EInstructorQuestionSortBy,
  EInstructorQuestionStatusBy,
} from '@src/instructor/enums/instructor.enum';
import { QuestionStatusDto } from '@src/question/dtos/question-status.dto';
import { QuestionVoteDto } from '@src/question/dtos/question-vote.dto';
import { EQuestionVoteDtoType } from '@src/question/question-vote/enums/question-vote.enum';

describe('QuestionService', () => {
  let questionService: QuestionService;
  let questionRepository: Repository<QuestionEntity>;
  let courseService: CourseService;
  let questionVoteService: QuestionVoteService;
  let courseUserService: CourseUserService;
  let eventEmitter2: EventEmitter2;

  const courseId = 'uuid';
  const questionId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getRepositoryToken(QuestionEntity),
          useValue: mockQuestionRepository,
        },
        { provide: CourseService, useValue: mockCourseService },
        { provide: QuestionVoteService, useValue: mockQuestionVoteService },
        { provide: CourseUserService, useValue: mockCourseUserService },
        { provide: EventEmitter2, useValue: mockEventEmitter2 },
      ],
    }).compile();

    questionService = module.get<QuestionService>(QuestionService);
    questionRepository = module.get<Repository<QuestionEntity>>(
      getRepositoryToken(QuestionEntity),
    );
    courseService = module.get<CourseService>(CourseService);
    questionVoteService = module.get<QuestionVoteService>(QuestionVoteService);
    courseUserService = module.get<CourseUserService>(CourseUserService);
    eventEmitter2 = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(questionService).toBeDefined();
    expect(questionRepository).toBeDefined();
    expect(courseService).toBeDefined();
    expect(questionVoteService).toBeDefined();
    expect(courseUserService).toBeDefined();
    expect(eventEmitter2).toBeDefined();
  });

  describe('[모든 질문글 조회]', () => {
    let query: QuestionListQueryDto;

    beforeEach(() => {
      query = new QuestionListQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(questionRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockQuestionsWithOutComment);

      const result = await questionService.findAll(query);

      expect(result).toEqual(expectedQuestionWithoutComment);
      expect(
        questionRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(2);
      expect(questionRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(
        questionRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });

    it('검색 필터 호출 테스트 - 질문 상태', async () => {
      const status = EQuestionStatus.Resolved;
      query.status = status;

      await questionService.findAll(query);

      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'question.questionStatus = :status',
        { status },
      );
    });

    it('검색 필터 호출 테스트 - 검색어', async () => {
      const s = '검색어';
      query.s = s;

      await questionService.findAll(query);

      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'LOWER(question.title) LIKE LOWER(:title)',
        {
          title: `%${s.toLowerCase()}%`,
        },
      );
    });

    it('정렬 필터 호출 테스트 - 댓글많은순', async () => {
      query.sort = EQuestionSortBy.Comment;

      await questionService.findAll(query);

      expect(questionRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'question.commetCount',
        'DESC',
      );
    });

    it('정렬 필터 호출 테스트 - 추천많은순', async () => {
      query.sort = EQuestionSortBy.Vote;

      await questionService.findAll(query);

      expect(questionRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'question.voteCount',
        'DESC',
      );
      expect(questionRepository.createQueryBuilder().addOrderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'question.created_at',
        'DESC',
      );
    });

    it('정렬 필터 호출 테스트 - 최신순', async () => {
      query.sort = EQuestionSortBy.Recent;

      await questionService.findAll(query);

      expect(questionRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'question.created_at',
        'DESC',
      );
    });

    it('정렬 필터 호출 테스트 - 오래된순', async () => {
      query.sort = EQuestionSortBy.Old;

      await questionService.findAll(query);

      expect(questionRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'question.created_at',
        'ASC',
      );
    });
  });

  describe('[강의의 질문글들 조회]', () => {
    let query: QuestionListQueryDto;

    beforeEach(() => {
      query = new QuestionListQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(questionRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockQuestionsWithOutComment);

      const result = await questionService.findAllByCourse(courseId, query);

      expect(result).toEqual(expectedQuestionWithoutComment);
      expect(
        questionRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(2);
      expect(questionRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(
        questionRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });

    it('검색 필터 호출 테스트 - 검색어', async () => {
      const s = '검색어';
      query.s = s;

      await questionService.findAllByCourse(courseId, query);

      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'LOWER(question.title) LIKE LOWER(:title)',
        {
          title: `%${s.toLowerCase()}%`,
        },
      );
    });

    it('조회 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionService.findAllByCourse(courseId, query);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[질문글 상세 조회]', () => {
    const QUESTION_HIT_EVENT = 'question.hit';

    it('조회 성공', async () => {
      jest
        .spyOn(questionRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(mockQuestionWithComment);

      jest.spyOn(eventEmitter2, 'emit').mockReturnValue(true);

      const result = await questionService.findOne(questionId);

      expect(result).toEqual(expectedQuestionDetail);
      expect(
        questionRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(6);
      expect(questionRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledTimes(
        1,
      );
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(
        questionRepository.createQueryBuilder().addOrderBy,
      ).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().getOne).toBeCalledTimes(1);
      expect(eventEmitter2.emit).toBeCalled();
      expect(eventEmitter2.emit).toBeCalledWith(
        QUESTION_HIT_EVENT,
        new QuestionHitEvent(questionId),
      );
    });

    it('조회 실패 - 해당 질문글이 없는 경우(404에러)', async () => {
      jest
        .spyOn(questionRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(null);

      try {
        await questionService.findOne(questionId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[내가 쓴 질문글들 조회(서비스로직)]', () => {
    let query: UserQuestionQueryDto;

    beforeEach(() => {
      query = new UserQuestionQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(questionRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockQuestionsWithOutComment);

      const result = await questionService.findMyQuestions(query, userId);

      expect(result).toEqual(expectedMyQuestionWithoutComment);
      expect(
        questionRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(2);
      expect(questionRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(questionRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(
        questionRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });

    it('검색 필터 호출 테스트 - 질문글 상태', async () => {
      const status = EQuestionStatus.Resolved;
      query.status = status;

      await questionService.findMyQuestions(query, userId);

      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'question.questionStatus = :status',
        { status },
      );
    });
  });

  describe('[지식공유자가 만든 강의의 질문글들 조회(서비스로직)]', () => {
    let query: InstructorQuestionQueryDto;
    const courseIds = ['uuid1', 'uuid2'];
    const emptyCourseIds = [];

    beforeEach(() => {
      query = new InstructorQuestionQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(questionRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockQuestionsWithOutComment);

      const result = await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(result).toEqual(expectedQuestionWithoutComment);
      expect(
        questionRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(2);
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(questionRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(
        questionRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });

    it('지식공유자가 만든 강의가 최소 1개 이상 있는 경우 호출 테스트', async () => {
      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().where).toBeCalled();
      expect(questionRepository.createQueryBuilder().where).toBeCalledWith(
        'question.fk_course_id IN (:...courseIds)',
        { courseIds },
      );
    });

    it('지식공유자가 만든 강의가 없는 경우 빈 배열 반환을 위한 조건설정 테스트', async () => {
      await questionService.findQuestionsByInstructorCourse(
        emptyCourseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().where).toBeCalled();
      expect(questionRepository.createQueryBuilder().where).toBeCalledWith(
        '1 = 0',
      );
    });

    it('검색 필터 호출 테스트 - 강의별로 조회', async () => {
      query.courseId = 'uuid';

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'question.fk_course_id = :courseId',
        { courseId },
      );
    });

    it('검색 필터 호출 테스트 - 해결된 질문', async () => {
      const status = EInstructorQuestionStatusBy.Resolved;
      query.status = status;

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'question.questionStatus = :status',
        { status },
      );
    });

    it('검색 필터 호출 테스트 - 해결안된 질문', async () => {
      const status = EInstructorQuestionStatusBy.NotResolved;
      query.status = status;

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'question.questionStatus = :status',
        { status },
      );
    });

    it('검색 필터 호출 테스트 - 답변된 질문', async () => {
      const status = EInstructorQuestionStatusBy.Comment;
      query.status = status;

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );
      expect(questionRepository.createQueryBuilder().leftJoin).toBeCalled();
      expect(questionRepository.createQueryBuilder().leftJoin).toBeCalledWith(
        'question.questionComments',
        'comment',
      );
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'comment.fk_user_id = :userId',
        { userId },
      );
    });

    it('검색 필터 호출 테스트 - 답변안된 질문', async () => {
      const status = EInstructorQuestionStatusBy.NotComment;
      query.status = status;

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().leftJoin).toBeCalled();
      expect(questionRepository.createQueryBuilder().leftJoin).toBeCalledWith(
        'question.questionComments',
        'comment',
      );
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'comment.fk_user_id != :userId',
        { userId },
      );
    });

    it('정렬 필터 호출 테스트 - 최근순', async () => {
      query.sort = EInstructorQuestionSortBy.Recent;

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'question.created_at',
        'DESC',
      );
    });

    it('정렬 필터 호출 테스트 - 오래된순', async () => {
      query.sort = EInstructorQuestionSortBy.Old;

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'question.created_at',
        'ASC',
      );
    });

    it('정렬 필터 호출 테스트 - 추천순', async () => {
      query.sort = EInstructorQuestionSortBy.Vote;

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'question.voteCount',
        'DESC',
      );
      expect(questionRepository.createQueryBuilder().addOrderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'question.created_at',
        'DESC',
      );
    });

    it('정렬 필터 호출 테스트 - 최근답변순', async () => {
      query.sort = EInstructorQuestionSortBy.Comment_Recent;

      await questionService.findQuestionsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(questionRepository.createQueryBuilder().leftJoin).toBeCalled();
      expect(questionRepository.createQueryBuilder().leftJoin).toBeCalledWith(
        'question.questionComments',
        'comment',
        'comment.created_at = (SELECT MAX(created_at) FROM questions_comments WHERE fk_question_id = question.id)',
      );
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(questionRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'comment.fk_user_id = :userId',
        { userId },
      );
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'comment.created_at',
        'DESC',
      );
    });
  });

  describe('[질문글 생성]', () => {
    it('생성 성공', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockResolvedValue(undefined);
      jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue(mockCreatedQuestion);

      const result = await questionService.create(
        mockCreateQuestionDto,
        userId,
      );

      expect(result).toEqual(mockCreatedQuestion);
      expect(courseUserService.validateBoughtCourseByUser).toBeCalled();
    });

    it('생성 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionService.create(mockCreateQuestionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('생성 실패 - 해당 강의를 구매 안한 경우(403에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockRejectedValue(new ForbiddenException());

      try {
        await questionService.create(mockCreateQuestionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[질문글 수정]', () => {
    const updateResult = { message: '수정 성공' };

    it('수정 성공', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue(mockCreatedQuestion);

      const result = await questionService.update(
        questionId,
        mockUpdateQuestionDto,
        userId,
      );

      expect(result).toEqual(updateResult);
    });

    it('수정 실패 - 해당 질문글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionService.update(questionId, mockUpdateQuestionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('수정 실패 - 작성자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockRejectedValue(new ForbiddenException());

      try {
        await questionService.update(questionId, mockUpdateQuestionDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[질문글 상태 바꾸기(해결,미해결)]', () => {
    let status: QuestionStatusDto;

    beforeEach(() => {
      status = new QuestionStatusDto();
    });

    it('상태 바꾸기 성공', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionRepository, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      const result = await questionService.status(questionId, status, userId);

      expect(result).toBeUndefined();
    });

    it('같은 상태일 경우 update 미호출', async () => {
      status = { status: EQuestionStatus.UnResolved };
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);

      await questionService.status(questionId, status, userId);

      expect(questionRepository.update).not.toBeCalled();
    });

    it('상태 바꾸기 실패 - 해당 질문글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionService.status(questionId, status, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('상태 바꾸기 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockRejectedValue(new ForbiddenException());

      try {
        await questionService.status(questionId, status, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[질문글 삭제]', () => {
    it('삭제 성공', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionRepository, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await questionService.delete(questionId, userId);

      expect(result).toBe(true);
    });

    it('삭제 실패 - 해당 질문글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionService.delete(questionId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('삭제 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockRejectedValue(new ForbiddenException());

      try {
        await questionService.delete(questionId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[calculateQuestionCountByCourseId 로직 테스트 - 질문글 개수 구하는 로직]', () => {
    it('로직 성공', async () => {
      jest.spyOn(questionRepository, 'count').mockResolvedValue(10);

      const result = await questionService.calculateQuestionCountByCourseId(
        courseId,
      );

      expect(result).toBe(10);
    });
  });

  describe('[질문글 투표(추천,비추천)]', () => {
    const vote = new QuestionVoteDto();
    vote.vote = EQuestionVoteDtoType.UPVOTE;

    it('투표 성공', async () => {
      jest
        .spyOn(questionService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedQuestion);
      jest
        .spyOn(questionVoteService, 'handleVoteUpdate')
        .mockResolvedValue(undefined);

      const result = await questionService.updateVoteStatus(
        questionId,
        userId,
        vote,
      );

      expect(result).toBeUndefined();
      expect(questionVoteService.handleVoteUpdate).toBeCalledWith(
        questionId,
        userId,
        vote.vote,
      );
    });

    it('투표 실패 - 해당 질문글이 없는 경우(404에러)', async () => {
      jest.spyOn(questionService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await questionService.updateVoteStatus(questionId, userId, vote);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
