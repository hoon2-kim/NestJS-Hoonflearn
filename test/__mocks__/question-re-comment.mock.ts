import { QuestionCommentEntity } from '@src/question-comment/entities/question-comment.entity';
import { CreateQuestionReCommentDto } from '@src/question-comment/question-reComment/dtos/request/create-question-recomment.dto';
import { UpdateQuestionReCommentDto } from '@src/question-comment/question-reComment/dtos/request/update-question-recomment.dto';

export const mockCreateQuestionReCommentDto: CreateQuestionReCommentDto = {
  contents: '대댓글',
};

export const mockUpdateQuestionReCommentDto: UpdateQuestionReCommentDto = {
  contents: '수정',
};

export const mockCreatedQuestionReComment = {
  id: 'uuid',
  fk_question_id: 'uuid',
  fk_user_id: 'uuid',
  fk_question_comment_parentId: 'uuid',
  contents: '댓글',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
} as QuestionCommentEntity;

export const mockQuestionReCommentService = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
