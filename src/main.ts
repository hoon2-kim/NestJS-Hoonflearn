import { HttpExceptionFilter } from './common/filters/http-api-exception.filter';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ReviewResponseWithCommentDto,
  ReviewResponseWithoutCommentDto,
} from './review/dtos/response/review.response.dto';
import {
  CourseListByInstructorResponseDto,
  CourseListResponseDto,
} from './course/dtos/response/course.response';
import { PageMetaDto } from './common/dtos/page-meta.dto';
import { QuestionListResponseDto } from './question/dtos/response/question.response.dto';
import { OrdersResponseDto } from './order/dtos/response/order.response.dto';
import { CourseUserListResponseDto } from './course_user/dtos/response/course-user.response.dto';
import { CourseWishListResponseDto } from './course_wish/dtos/response/course-wish.reponse.dto';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // dto에 없는 속성 거르기
      forbidNonWhitelisted: true, // 전달하는 요청 값 중에 정의 되지않은 값이 있다면 오류 발생시키기
      transform: true, // 객체를 자동으로 dto로 변환
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());

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

  await app.listen(process.env.SERVER_PORT || 8080);
}
bootstrap();
