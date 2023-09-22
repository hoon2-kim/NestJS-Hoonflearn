import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CartResponseDto } from '@src/cart/dtos/response/cart.response.dto';

export const ApiGetMyCartSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '조회 성공', type: CartResponseDto }),
    ApiUnauthorizedResponse({ description: '로그인을 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiInsertCourseInCartSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '담기 성공',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiBadRequestResponse({
      description:
        '해당 강의가 존재하지 않는 경우 / 이미 장바구니에 해당 강의를 넣은 경우 / 무료인 강의를 넣을 경우 / 이미 구매한 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인을 하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteCourseInCartSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '삭제 성공', type: 'boolean' }),
    ApiBadRequestResponse({
      description: '해당 강의가 존재하지 않는 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인을 하지 않은 경우' }),
    ApiNotFoundResponse({ description: '장바구니가 존재하지 않는 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
