import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { ReviewEntity } from '@src/review/entities/review.entity';

export const ApiGetMyCoursesByInstructorSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(CourseEntity) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiForbiddenResponse({ description: '지식공유자가 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetQuestionsByMyCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(QuestionEntity) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiForbiddenResponse({ description: '지식공유자가 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetReviewsByMyCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(ReviewEntity) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiForbiddenResponse({ description: '지식공유자가 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiRegisterInstructorSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '등록 성공',
      schema: {
        properties: {
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
        },
      },
    }),
    ApiBadRequestResponse({
      description:
        '이미 지식공유자로 등록한 경우 / 이미 존재하는 이메일일 경우 / 이미 존재하는 지식공유자 실명 또는 사업체명일 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
