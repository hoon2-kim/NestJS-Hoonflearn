import { CreateQuestionCommentDto } from '@src/question-comment/dtos/request/create-question-comment.dto';
import { UpdateQuestionCommentDto } from '@src/question-comment/dtos/request/update-question-comment.dto';
import { QuestionCommentEntity } from '@src/question-comment/entities/question-comment.entity';

export const mockCreateQuestionCommentDto: CreateQuestionCommentDto = {
  contents: '댓글',
};

export const mockUpdateQuestionCommentDto: UpdateQuestionCommentDto = {
  contents: '댓글수정',
};

export const mockCreatedQuestionComment = {
  id: 'uuid',
  fk_question_id: 'uuid',
  fk_user_id: 'uuid',
  fk_question_comment_parentId: null,
  contents: '댓글',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
} as QuestionCommentEntity;

export const mockQuestionCommentRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

export const mockQuestionService = {
  findOneByOptions: jest.fn(),
};

export const mockQuestionCommentService = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
