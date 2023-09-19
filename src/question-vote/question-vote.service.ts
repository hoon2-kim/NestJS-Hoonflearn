import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from 'src/question/entities/question.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { QuestionVoteEntity } from './entities/question-vote.entity';
import {
  EQuestionVoteDtoType,
  EQuestionVoteType,
} from './enums/question-vote.enum';

@Injectable()
export class QuestionVoteService {
  constructor(
    @InjectRepository(QuestionVoteEntity)
    private readonly questionVoteRepository: Repository<QuestionVoteEntity>,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<QuestionVoteEntity>,
  ): Promise<QuestionVoteEntity | null> {
    const questionVote: QuestionVoteEntity | null =
      await this.questionVoteRepository.findOne(options);

    return questionVote;
  }

  async getCurrentVote(questionId: string, userId: string) {
    const vote = await this.questionVoteRepository.findOne({
      where: {
        fk_question_id: questionId,
        fk_user_id: userId,
      },
    });

    return vote ? vote.voteType : null;
  }

  async handleVoteUpdate(
    questionId: string,
    userId: string,
    vote: EQuestionVoteDtoType,
  ) {
    const currentVote = await this.getCurrentVote(questionId, userId);

    switch (vote) {
      /** UPVOTE를 한 경우 */
      case EQuestionVoteDtoType.UPVOTE:
        return currentVote === EQuestionVoteType.DOWNVOTE
          ? this.changeVote(questionId, userId, vote, 2)
          : this.addVote(questionId, userId, vote, 1);

      case EQuestionVoteDtoType.DOWNVOTE:
        return currentVote === EQuestionVoteType.UPVOTE
          ? this.changeVote(questionId, userId, vote, -2)
          : this.addVote(questionId, userId, vote, -1);

      case EQuestionVoteDtoType.NONE:
        return this.deleteVote(questionId, userId, currentVote);

      default:
        throw new BadRequestException('잘못된 투표 형식입니다.');
    }
  }

  async changeVote(
    qestionId: string,
    userId: string,
    newVote: EQuestionVoteDtoType,
    changeVoteCount: number,
  ) {
    await this.questionVoteRepository.manager.transaction(async (manager) => {
      await manager.update(
        QuestionVoteEntity,
        { fk_question_id: qestionId, fk_user_id: userId },
        { voteType: newVote as unknown as EQuestionVoteType },
      );
      await manager.increment(
        QuestionEntity,
        { id: qestionId },
        'voteCount',
        changeVoteCount,
      );
    });
  }

  async addVote(
    qestionId: string,
    userId: string,
    newVote: EQuestionVoteDtoType,
    changeVoteCount: number,
  ) {
    await this.questionVoteRepository.manager.transaction(async (manager) => {
      await manager.save(QuestionVoteEntity, {
        fk_question_id: qestionId,
        fk_user_id: userId,
        voteType: newVote as unknown as EQuestionVoteType,
      });
      await manager.increment(
        QuestionEntity,
        { id: qestionId },
        'voteCount',
        changeVoteCount,
      );
    });
  }

  async deleteVote(
    qestionId: string,
    userId: string,
    currentVote: EQuestionVoteType,
  ) {
    if (!currentVote) {
      return;
    }

    await this.questionVoteRepository.manager.transaction(async (manager) => {
      await manager.delete(QuestionVoteEntity, {
        fk_question_id: qestionId,
        fk_user_id: userId,
      });

      if (currentVote === EQuestionVoteType.UPVOTE) {
        await manager.decrement(
          QuestionEntity,
          { id: qestionId },
          'voteCount',
          1,
        );
      } else if (currentVote === EQuestionVoteType.DOWNVOTE) {
        await manager.increment(
          QuestionEntity,
          { id: qestionId },
          'voteCount',
          1,
        );
      }
    });
  }
}
