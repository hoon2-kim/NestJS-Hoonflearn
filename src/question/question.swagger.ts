import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import {
  QuestionDetailResponseDto,
  QuestionListResponseDto,
} from '@src/question/dtos/response/question.response.dto';
import { QuestionEntity } from '@src/question/entities/question.entity';

export const ApiGetAllQuestionsSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(QuestionListResponseDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetQuestionsByCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(QuestionListResponseDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiNotFoundResponse({ description: '해당 강의가 존재하지 않는 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetQuestionSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      type: QuestionDetailResponseDto,
    }),
    ApiNotFoundResponse({ description: '해당 질문글이 존재하지 않을 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCreateQuestionSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '질문글 작성 성공',
      type: QuestionEntity,
    }),
    ApiNotFoundResponse({ description: '해당 강의가 존재하지 않을 경우' }),
    ApiForbiddenResponse({ description: '해당 강의를 구매하지 않았을 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiVoteQuestionSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '투표(추천,비추천) 또는 투표 취소 성공',
    }),
    ApiNotFoundResponse({ description: '해당 질문글이 존재하지 않을 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateQuestionSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '수정 성공 / 아무것도 반환 안함' }),
    ApiNotFoundResponse({ description: '해당 질문글이 존재하지 않을 경우' }),
    ApiForbiddenResponse({
      description: '해당 질문글을 작성한 본인이 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiReactionQuestionSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '리액션 성공 / 아무것도 반환 안함' }),
    ApiNotFoundResponse({ description: '해당 질문글이 존재하지 않을 경우' }),
    ApiForbiddenResponse({
      description: '해당 질문글을 작성한 본인이 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteQuestionSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '삭제 성공', type: 'boolean' }),
    ApiNotFoundResponse({ description: '해당 질문글이 존재하지 않을 경우' }),
    ApiForbiddenResponse({
      description: '해당 질문글을 작성한 본인이 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
