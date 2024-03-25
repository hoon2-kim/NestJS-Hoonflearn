import { Test, TestingModule } from '@nestjs/testing';
import { QuestionVoteService } from '@src/question/question-vote/question-vote.service';
import { DataSource, Repository } from 'typeorm';
import { QuestionVoteEntity } from '@src/question/question-vote/entities/question-vote.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  EQuestionVoteDtoType,
  EQuestionVoteType,
} from '../enums/question-vote.enum';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { mockQuestionVoteRepository } from '@test/__mocks__/mock-repository';
import { mockQuestionVote } from '@test/__mocks__/mock-data';

describe('QuestionVoteService', () => {
  let questionVoteService: QuestionVoteService;
  let questionVoteRepository: Repository<QuestionVoteEntity>;
  let dataSource: DataSource;

  const questionId = 'uuid';
  const userId = 'uuid';

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionVoteService,
        {
          provide: getRepositoryToken(QuestionVoteEntity),
          useValue: mockQuestionVoteRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    questionVoteService = module.get<QuestionVoteService>(QuestionVoteService);
    questionVoteRepository = module.get<Repository<QuestionVoteEntity>>(
      getRepositoryToken(QuestionVoteEntity),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(questionVoteService).toBeDefined();
    expect(questionVoteRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('[질문글 투표(추천,비추천,취소] 서비스 로직 테스트', () => {
    let vote: EQuestionVoteDtoType;
    let convertVoteType: EQuestionVoteType;

    beforeEach(() => {
      vote = null;
      convertVoteType = null;
    });

    it('처음 투표하는 경우(추천)', async () => {
      vote = EQuestionVoteDtoType.UPVOTE;
      convertVoteType = EQuestionVoteType.UPVOTE;

      jest.spyOn(questionVoteService, 'getCurrentVote').mockResolvedValue(null);
      jest
        .spyOn(questionVoteService, 'upsertVote')
        .mockResolvedValue(undefined);
      jest
        .spyOn(questionVoteService, 'convertDtoTypeToEntityType')
        .mockReturnValue(convertVoteType);
      jest.spyOn(questionVoteService, 'calculateVoteValue').mockReturnValue(1);

      const result = await questionVoteService.handleVoteUpdate(
        questionId,
        userId,
        vote,
      );

      expect(result).toBeUndefined();
      expect(questionVoteService.upsertVote).toBeCalledTimes(1);
      expect(questionVoteService.convertDtoTypeToEntityType).toBeCalledTimes(1);
      expect(questionVoteService.calculateVoteValue).toBeCalledTimes(1);
      expect(
        questionVoteService.calculateVoteValue(convertVoteType, false),
      ).toBe(1);
    });

    it('처음 투표하는 경우(비추천)', async () => {
      vote = EQuestionVoteDtoType.DOWNVOTE;
      convertVoteType = EQuestionVoteType.DOWNVOTE;

      jest.spyOn(questionVoteService, 'getCurrentVote').mockResolvedValue(null);
      jest
        .spyOn(questionVoteService, 'upsertVote')
        .mockResolvedValue(undefined);
      jest
        .spyOn(questionVoteService, 'convertDtoTypeToEntityType')
        .mockReturnValue(convertVoteType);
      jest.spyOn(questionVoteService, 'calculateVoteValue').mockReturnValue(-1);

      const result = await questionVoteService.handleVoteUpdate(
        questionId,
        userId,
        vote,
      );

      expect(result).toBeUndefined();
      expect(questionVoteService.upsertVote).toBeCalledTimes(1);
      expect(questionVoteService.convertDtoTypeToEntityType).toBeCalledTimes(1);
      expect(questionVoteService.calculateVoteValue).toBeCalledTimes(1);
      expect(
        questionVoteService.calculateVoteValue(convertVoteType, false),
      ).toBe(-1);
    });

    it('투표를 취소하는 경우(추천했다가 취소)', async () => {
      vote = EQuestionVoteDtoType.NONE;
      convertVoteType = EQuestionVoteType.UPVOTE;

      jest
        .spyOn(questionVoteService, 'getCurrentVote')
        .mockResolvedValue(EQuestionVoteType.UPVOTE);
      jest
        .spyOn(questionVoteService, 'deleteVote')
        .mockResolvedValue(undefined);

      const result = await questionVoteService.handleVoteUpdate(
        questionId,
        userId,
        vote,
      );

      expect(result).toBeUndefined();
      expect(questionVoteService.deleteVote).toBeCalledTimes(1);
      expect(questionVoteService.deleteVote).toBeCalledWith(
        questionId,
        userId,
        convertVoteType,
      );
    });

    it('투표를 취소하는 경우(비추천했다가 취소)', async () => {
      vote = EQuestionVoteDtoType.NONE;
      convertVoteType = EQuestionVoteType.DOWNVOTE;

      jest
        .spyOn(questionVoteService, 'getCurrentVote')
        .mockResolvedValue(EQuestionVoteType.DOWNVOTE);
      jest
        .spyOn(questionVoteService, 'deleteVote')
        .mockResolvedValue(undefined);

      const result = await questionVoteService.handleVoteUpdate(
        questionId,
        userId,
        vote,
      );

      expect(result).toBeUndefined();
      expect(questionVoteService.deleteVote).toBeCalledTimes(1);
      expect(questionVoteService.deleteVote).toBeCalledWith(
        questionId,
        userId,
        convertVoteType,
      );
    });

    it('투표를 바꾸는 경우(추천 -> 비추천)', async () => {
      vote = EQuestionVoteDtoType.DOWNVOTE;
      convertVoteType = EQuestionVoteType.DOWNVOTE;

      jest
        .spyOn(questionVoteService, 'getCurrentVote')
        .mockResolvedValue(EQuestionVoteType.UPVOTE);
      jest
        .spyOn(questionVoteService, 'convertDtoTypeToEntityType')
        .mockReturnValue(convertVoteType);
      jest.spyOn(questionVoteService, 'calculateVoteValue').mockReturnValue(-2);
      jest
        .spyOn(questionVoteService, 'upsertVote')
        .mockResolvedValue(undefined);

      const result = await questionVoteService.handleVoteUpdate(
        questionId,
        userId,
        vote,
      );

      expect(result).toBeUndefined();
      expect(questionVoteService.getCurrentVote).toBeCalledTimes(1);
      expect(questionVoteService.convertDtoTypeToEntityType).toBeCalledTimes(1);
      expect(questionVoteService.calculateVoteValue).toBeCalledTimes(1);
      expect(
        questionVoteService.calculateVoteValue(convertVoteType, true),
      ).toBe(-2);
      expect(questionVoteService.upsertVote).toBeCalledTimes(1);
    });

    it('투표를 바꾸는 경우(비추천 -> 추천)', async () => {
      vote = EQuestionVoteDtoType.UPVOTE;
      convertVoteType = EQuestionVoteType.UPVOTE;

      jest
        .spyOn(questionVoteService, 'getCurrentVote')
        .mockResolvedValue(EQuestionVoteType.DOWNVOTE);
      jest
        .spyOn(questionVoteService, 'convertDtoTypeToEntityType')
        .mockReturnValue(convertVoteType);
      jest.spyOn(questionVoteService, 'calculateVoteValue').mockReturnValue(2);
      jest
        .spyOn(questionVoteService, 'upsertVote')
        .mockResolvedValue(undefined);

      const result = await questionVoteService.handleVoteUpdate(
        questionId,
        userId,
        vote,
      );

      expect(result).toBeUndefined();
      expect(questionVoteService.getCurrentVote).toBeCalledTimes(1);
      expect(questionVoteService.convertDtoTypeToEntityType).toBeCalledTimes(1);
      expect(questionVoteService.calculateVoteValue).toBeCalledTimes(1);
      expect(
        questionVoteService.calculateVoteValue(convertVoteType, true),
      ).toBe(2);
      expect(questionVoteService.upsertVote).toBeCalledTimes(1);
    });
  });

  describe('[upsertVote 로직 테스트]', () => {
    const mockIncrement = jest
      .fn()
      .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

    it('처음 투표의 경우 엔티티 저장 및 투표 수 수정', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockQuestionVote);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        return await cb({ save: mockSave, increment: mockIncrement });
      });

      const result = await questionVoteService.upsertVote(
        questionId,
        userId,
        EQuestionVoteType.UPVOTE,
        1,
        false,
      );

      expect(result).toBeUndefined();
      expect(mockSave).toBeCalledWith(QuestionVoteEntity, {
        fk_question_id: questionId,
        fk_user_id: userId,
        voteType: EQuestionVoteType.UPVOTE,
      });
      expect(mockIncrement).toBeCalledWith(
        QuestionEntity,
        {
          id: questionId,
        },
        'voteCount',
        1,
      );
    });

    it('투표를 바꾸는 경우 엔티티 수정 및 투표 수 수정', async () => {
      const mockUpdate = jest
        .fn()
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        return await cb({ update: mockUpdate, increment: mockIncrement });
      });

      const result = await questionVoteService.upsertVote(
        questionId,
        userId,
        EQuestionVoteType.DOWNVOTE,
        -2,
        true,
      );

      expect(result).toBeUndefined();
      expect(mockUpdate).toBeCalledWith(
        QuestionVoteEntity,
        { fk_question_id: questionId, fk_user_id: userId },
        { voteType: EQuestionVoteType.DOWNVOTE },
      );
      expect(mockIncrement).toBeCalledWith(
        QuestionEntity,
        {
          id: questionId,
        },
        'voteCount',
        -2,
      );
    });
  });

  describe('[calculateVoteValue 로직 테스트]', () => {
    let voteType: EQuestionVoteType;
    let isChange: boolean;

    beforeEach(() => {
      voteType = null;
      isChange = false;
    });

    it('처음 투표 - 추천일 경우 1 반환', () => {
      voteType = EQuestionVoteType.UPVOTE;

      const result = questionVoteService.calculateVoteValue(voteType, isChange);

      expect(result).toBe(1);
    });

    it('처음 투표 - 비추천일 경우 -1 반환', () => {
      voteType = EQuestionVoteType.DOWNVOTE;

      const result = questionVoteService.calculateVoteValue(voteType, isChange);

      expect(result).toBe(-1);
    });

    it('투표 변경 - 추천->비추천일 경우 -2 반환', () => {
      voteType = EQuestionVoteType.DOWNVOTE;
      isChange = true;

      const result = questionVoteService.calculateVoteValue(voteType, isChange);

      expect(result).toBe(-2);
    });

    it('투표 변경 - 비추천->추천일 경우 2 반환', () => {
      voteType = EQuestionVoteType.UPVOTE;
      isChange = true;

      const result = questionVoteService.calculateVoteValue(voteType, isChange);

      expect(result).toBe(2);
    });
  });

  describe('[deleteVote 로직 테스트]', () => {
    let currentVote: EQuestionVoteType;
    const mockDelete = jest.fn().mockResolvedValue({ raw: [], affected: 1 });
    const mockIncrement = jest
      .fn()
      .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

    beforeEach(() => {
      currentVote = null;
    });

    it('추천 -> 취소하는 경우 엔티티 삭제 및 투표수 변경', async () => {
      currentVote = EQuestionVoteType.UPVOTE;
      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        return await cb({ delete: mockDelete, increment: mockIncrement });
      });

      const result = await questionVoteService.deleteVote(
        questionId,
        userId,
        currentVote,
      );

      expect(result).toBeUndefined();
      expect(mockDelete).toBeCalledWith(QuestionVoteEntity, {
        fk_question_id: questionId,
        fk_user_id: userId,
      });
      expect(mockIncrement).toBeCalledWith(
        QuestionEntity,
        { id: questionId },
        'voteCount',
        -1,
      );
    });

    it('비추천 -> 취소하는 경우 엔티티 삭제 및 투표수 변경', async () => {
      currentVote = EQuestionVoteType.DOWNVOTE;
      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        return await cb({ delete: mockDelete, increment: mockIncrement });
      });

      const result = await questionVoteService.deleteVote(
        questionId,
        userId,
        currentVote,
      );

      expect(result).toBeUndefined();
      expect(mockDelete).toBeCalledWith(QuestionVoteEntity, {
        fk_question_id: questionId,
        fk_user_id: userId,
      });
      expect(mockIncrement).toBeCalledWith(
        QuestionEntity,
        { id: questionId },
        'voteCount',
        1,
      );
    });
  });

  describe('[getCurrentVote 로직 테스트]', () => {
    it('투표 변경할 경우 내가 투표했던 타입 반환', async () => {
      const vote = EQuestionVoteType.UPVOTE;
      jest
        .spyOn(questionVoteRepository, 'findOne')
        .mockResolvedValue(mockQuestionVote);

      const result = await questionVoteService.getCurrentVote(
        questionId,
        userId,
      );

      expect(result).toBe(vote);
    });

    it('내가 투표했던 적이 없는 경우 null 반환', async () => {
      jest.spyOn(questionVoteRepository, 'findOne').mockResolvedValue(null);

      const result = await questionVoteService.getCurrentVote(
        questionId,
        userId,
      );

      expect(result).toBeNull();
    });
  });
});
