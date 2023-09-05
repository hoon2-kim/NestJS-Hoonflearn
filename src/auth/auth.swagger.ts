import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ERoleType } from 'src/user/enums/user.enum';

export const ApiLoginSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '로그인 성공',
      schema: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          user: {
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              nickname: { type: 'string' },
              description: { type: 'string' },
              phone: { type: 'string' },
              profileAvatar: { type: 'string' },
              role: { enum: [ERoleType] },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      headers: {
        'Set-Cookie': {
          description: '로그인 후 쿠키에 설정되는 refresh_token',
          schema: {
            example: `refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM0NTE4MTIzLWRmZjEtNDA4NC1iOGY4LWViMGY2Yjc2ZWFjMyIsImVtYWlsIjoiaW5zMUBhLmNvbSIsInJvbGUiOiJJbnN0cnVjdG9yIiwiaWF0IjoxNjkzMzc5MjA5LCJleHAiOjE2OTQ1ODg4MDl9.Dtb4XXDC9ZKMODe94TVr2Ea6R5xJIgVFheX5ZW7sPV8; Path=/; HttpOnly; SameSite=None`,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '유저가 존재하지 않은 경우 / 비밀번호가 틀린 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiLogoutSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({ description: '로그아웃 성공', type: 'string' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

// TODO : test
export const ApiRestoreAccessTokenSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCookieAuth('refresh_token'),
    ApiCreatedResponse({
      description: '발급 성공',
      schema: {
        properties: { access_token: { type: 'string' } },
      },
    }),
    ApiForbiddenResponse({
      description: 'DB의 refresh_token과 Cookie의 refresh_token이 다른 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
