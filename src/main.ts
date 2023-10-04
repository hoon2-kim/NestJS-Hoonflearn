import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@src/api-docs.swagger';
import { HttpExceptionFilter } from '@src/common/filters/http-api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
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

  // swagger
  setupSwagger(app);

  await app.listen(process.env.SERVER_PORT || 8080);

  console.log(new Date());
  console.log(process.env.NODE_ENV);
  console.log('깃헙액션 테스트4');
}
bootstrap();
