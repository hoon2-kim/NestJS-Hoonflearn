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
  getSchemaPath,
} from '@nestjs/swagger';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { ReviewResponseWithCommentDto } from './dtos/response/review.response.dto';
import { ReviewEntity } from './entities/review.entity';

export const ApiGetAllReviewsByCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(ReviewResponseWithCommentDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiNotFoundResponse({ description: '해당 강의가 존재하지 않는 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCreateReviewSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '리뷰 작성 성공',
      type: ReviewEntity,
    }),
    ApiNotFoundResponse({ description: '해당 강의가 존재하지 않는 경우' }),
    ApiBadRequestResponse({ description: '이미 리뷰를 작성한 경우' }),
    ApiForbiddenResponse({ description: '해당 강의를 구매하지 않은 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateReviewSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '수정 성공 / 아무것도 반환 안함' }),
    ApiNotFoundResponse({ description: '해당 리뷰가 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description: '해당 리뷰를 작성한 본인이 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteReviewSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '리뷰 삭제 성공', type: 'boolean' }),
    ApiNotFoundResponse({ description: '해당 리뷰가 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description: '해당 리뷰를 작성한 본인이 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiLikeReviewSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '리뷰 좋아요 성공 / 아무것도 반환 안함' }),
    ApiNotFoundResponse({ description: '해당 리뷰가 존재하지 않는 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCancelLikeReviewSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '리뷰 좋아요 취소 성공 / 아무것도 반환 안함',
    }),
    ApiNotFoundResponse({ description: '해당 리뷰가 존재하지 않는 경우' }),
    ApiUnauthorizedResponse({ description: '로그인 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
