import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QuestionCommentEntity } from '@src/question/question-comment/entities/question-comment.entity';

export const ApiCreateQuestionCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '댓글 생성 성공',
      type: QuestionCommentEntity,
    }),
    ApiNotFoundResponse({ description: '해당 질문글이 존재하지 않는 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateQuestionCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '수정 성공',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    }),
    ApiNotFoundResponse({
      description:
        '해당 질문글이 존재하지 않는 경우 또는 해당 댓글이 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({ description: '댓글을 작성한 본인이 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteQuestionCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '댓글 삭제 성공', type: 'boolean' }),
    ApiNotFoundResponse({
      description:
        '해당 질문글이 존재하지 않는 경우 또는 해당 댓글이 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({ description: '댓글을 작성한 본인이 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

//

export const ApiCreateQuestionReCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '대댓글 생성 성공',
      type: QuestionCommentEntity,
    }),
    ApiNotFoundResponse({ description: '부모 댓글이 존재하지 않는 경우' }),
    ApiBadRequestResponse({ description: '대댓글에 댓글을 다려는 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateQuestionReCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '수정 성공',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: '해당 대댓글이 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({ description: '댓글을 작성한 본인이 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteQuestionReCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '대댓글 삭제 성공', type: 'boolean' }),
    ApiNotFoundResponse({
      description: '해당 대댓글이 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({ description: '댓글을 작성한 본인이 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
