import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import {
  OrderDetailResponseDto,
  OrdersResponseDto,
} from './dtos/response/order.response.dto';
import { OrderEntity } from './entities/order.entity';

export const ApiGetMyOrdersSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(OrdersResponseDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetMyOrderDetailSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({ description: '조회 성공', type: OrderDetailResponseDto }),
    ApiNotFoundResponse({ description: '해당 주문기록이 존재하지 않을 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCompleteOrderSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({ description: '주문 성공', type: OrderEntity }),
    ApiConflictResponse({ description: '이미 결제한 경우' }),
    ApiBadRequestResponse({
      description:
        '등록되지 않은 강의가 있는 경우 또는 가격이 일치하지 않는 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
