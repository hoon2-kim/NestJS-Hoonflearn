import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { CouponEntity } from './entities/coupon.entity';

export const ApiCreateCouponSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({
      summary,
    }),
    ApiOkResponse({
      description: '생성 성공',
      type: [CouponEntity],
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiRegisterCouponSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '등록 성공',
    }),
    ApiBadRequestResponse({
      description: '쿠폰 기한 만료 또는 이미 등록 한 경우 또는 소진 된 경우',
    }),
    ApiNotFoundResponse({ description: '쿠폰이 없는 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateCouponSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '수정 성공',
      type: CouponEntity,
    }),
    ApiForbiddenResponse({
      description: '해당 쿠폰을 만든 지식공유자가 아닌 경우',
    }),
    ApiNotFoundResponse({ description: '쿠폰이 없는 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
