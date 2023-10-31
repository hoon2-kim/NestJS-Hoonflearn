import { QuestionVoteEntity } from '@src/question-vote/entities/question-vote.entity';
import { EQuestionVoteType } from '@src/question-vote/enums/question-vote.enum';

export const mockCreatedQuestionVote = {
  id: 'uuid',
  fk_question_id: 'uuid',
  fk_user_id: 'uuid',
  voteType: EQuestionVoteType.UPVOTE,
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
} as QuestionVoteEntity;

export const mockQuestionVoteRepository = {
  findOne: jest.fn(),
};
