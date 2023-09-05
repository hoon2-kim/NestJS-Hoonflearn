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
} from '@nestjs/swagger';
import { ReviewCommentEntity } from './entities/review-comment.entity';

export const ApiCreateReviewCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '리뷰 댓글 생성 성공',
      type: ReviewCommentEntity,
    }),
    ApiNotFoundResponse({ description: '해당 리뷰가 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description: '해당 강의를 구매하지 않은 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateReviewCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '수정 성공 / 아무것도 반환 안함' }),
    ApiNotFoundResponse({
      description:
        '해당 리뷰가 존재하지 않는 경우 또는 수정하려는 리뷰 댓글이 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({
      description: '리뷰 댓글을 쓴 본인이 아닌 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteReviewCommentSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '리뷰 댓글 삭제 성공',
      type: 'boolean',
    }),
    ApiNotFoundResponse({
      description: '해당 리뷰 또는 리뷰 댓글이 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({
      description: '리뷰 댓글을 쓴 본인이 아닌 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
