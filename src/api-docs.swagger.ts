import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PageMetaDto } from './common/dtos/page-meta.dto';
import {
  CourseListByInstructorResponseDto,
  CourseListResponseDto,
} from './course/dtos/response/course.response';
import { CourseUserListResponseDto } from './course_user/dtos/response/course-user.response.dto';
import { CourseWishListResponseDto } from './course_wish/dtos/response/course-wish.reponse.dto';
import { OrdersResponseDto } from './order/dtos/response/order.response.dto';
import { QuestionListResponseDto } from './question/dtos/response/question.response.dto';
import {
  ReviewResponseWithCommentDto,
  ReviewResponseWithoutCommentDto,
} from './review/dtos/response/review.response.dto';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Hoonflearn-server')
    .setDescription('NestJS-REST-API-개인 프로젝트')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        bearerFormat: 'JWT',
        scheme: 'Bearer',
        name: 'JWT',
        description: '로그인 후 JWT - AccessToken 입력',
        in: 'header',
      },
      'access_token',
    )
    .addCookieAuth('refresh_token')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      PageMetaDto,
      ReviewResponseWithCommentDto,
      CourseListResponseDto,
      CourseListByInstructorResponseDto,
      QuestionListResponseDto,
      ReviewResponseWithoutCommentDto,
      OrdersResponseDto,
      CourseUserListResponseDto,
      CourseWishListResponseDto,
    ],
  });
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });
}