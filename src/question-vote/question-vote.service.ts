import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { QuestionVoteEntity } from '@src/question-vote/entities/question-vote.entity';
import {
  EQuestionVoteDtoType,
  EQuestionVoteType,
} from '@src/question-vote/enums/question-vote.enum';

const UPVOTE_CHANGE_VOTE_P_VALUE = 2;
const DOWNVOTE_CHANGE_VOTE_M_VALUE = -2;
const UPVOTE_ADD_VOTE_P_VALUE = 1;
const DOWNVOTE_ADD_VOTE_M_VALUE = -1;
const NONE_VOTE_P_VALUE = 1;
const NONE_VOTE_M_VALUE = -1;

@Injectable()
export class QuestionVoteService {
  constructor(
    @InjectRepository(QuestionVoteEntity)
    private readonly questionVoteRepository: Repository<QuestionVoteEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<QuestionVoteEntity>,
  ): Promise<QuestionVoteEntity | null> {
    const questionVote: QuestionVoteEntity | null =
      await this.questionVoteRepository.findOne(options);

    return questionVote;
  }

  async handleVoteUpdate(
    questionId: string,
    userId: string,
    vote: EQuestionVoteDtoType,
  ): Promise<void> {
    const currentVote = await this.getCurrentVote(questionId, userId);

    /** 투표 취소 */
    if (vote === EQuestionVoteDtoType.NONE) {
      return await this.deleteVote(questionId, userId, currentVote);
    }

    /** enum 타입 변환 */
    const convertEnum = this.convertDtoTypeToEntityType(vote);

    if (currentVote === convertEnum) {
      return;
    }

    /** 이미 투표했고 다른 투표로 바꾸는지 여부 */
    const isVoteChangeNeed = !!currentVote && currentVote !== convertEnum;

    const calculateValue = this.calculateVoteValue(
      convertEnum,
      isVoteChangeNeed,
    );

    return await this.upsertVote(
      questionId,
      userId,
      convertEnum,
      calculateValue,
      isVoteChangeNeed,
    );
  }

  async upsertVote(
    questionId: string,
    userId: string,
    voteType: EQuestionVoteType,
    value: number,
    isChange: boolean,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (isChange) {
        await manager.update(
          QuestionVoteEntity,
          { fk_question_id: questionId, fk_user_id: userId },
          { voteType },
        );
      } else {
        await manager.save(QuestionVoteEntity, {
          fk_question_id: questionId,
          fk_user_id: userId,
          voteType,
        });
      }

      await manager.increment(
        QuestionEntity,
        { id: questionId },
        'voteCount',
        value,
      );
    });
  }

  calculateVoteValue(voteType: EQuestionVoteType, isChange: boolean): number {
    const voteValueMapping = {
      [EQuestionVoteType.UPVOTE]: isChange
        ? UPVOTE_CHANGE_VOTE_P_VALUE
        : UPVOTE_ADD_VOTE_P_VALUE,
      [EQuestionVoteType.DOWNVOTE]: isChange
        ? DOWNVOTE_CHANGE_VOTE_M_VALUE
        : DOWNVOTE_ADD_VOTE_M_VALUE,
    };

    return voteValueMapping[voteType];
  }

  async deleteVote(
    questionId: string,
    userId: string,
    currentVote: EQuestionVoteType,
  ): Promise<void> {
    if (!currentVote) {
      return;
    }

    const value =
      currentVote === EQuestionVoteType.UPVOTE
        ? NONE_VOTE_M_VALUE
        : NONE_VOTE_P_VALUE;

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(QuestionVoteEntity, {
        fk_question_id: questionId,
        fk_user_id: userId,
      });

      await manager.increment(
        QuestionEntity,
        { id: questionId },
        'voteCount',
        value,
      );
    });
  }

  async getCurrentVote(
    questionId: string,
    userId: string,
  ): Promise<EQuestionVoteType | null> {
    const vote = await this.questionVoteRepository.findOne({
      where: {
        fk_question_id: questionId,
        fk_user_id: userId,
      },
    });

    return vote ? vote.voteType : null;
  }

  convertDtoTypeToEntityType(dtoType: EQuestionVoteDtoType): EQuestionVoteType {
    switch (dtoType) {
      case EQuestionVoteDtoType.UPVOTE:
        return EQuestionVoteType.UPVOTE;

      case EQuestionVoteDtoType.DOWNVOTE:
        return EQuestionVoteType.DOWNVOTE;

      default:
        throw new BadRequestException('잘못된 enum값이 들어왔습니다.');
    }
  }
}
