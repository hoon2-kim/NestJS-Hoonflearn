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
  ApiPayloadTooLargeResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { VideoEntity } from '@src/video/entities/video.entity';

export const ApiUploadVideoSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '영상 업로드 성공',
      type: VideoEntity,
    }),
    ApiBadRequestResponse({
      description:
        '파일이 없는 경우 또는 파일의 확장자가(mpg, mv4, mov, m2ts, mp4)가 아닌 경우',
    }),
    ApiPayloadTooLargeResponse({
      description: '파일 용량이 4GB를 넘어가는 경우',
    }),
    ApiForbiddenResponse({
      description:
        '해당 강의를 만든 지식공유자가 아닌 경우 또는 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteVideoSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '영상 삭제 성공',
      type: 'boolean',
    }),
    ApiNotFoundResponse({
      description: '영상이 없는 경우',
    }),
    ApiForbiddenResponse({
      description:
        '해당 강의를 만든 지식공유자가 아닌 경우 또는 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
