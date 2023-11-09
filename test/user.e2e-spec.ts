import {
  ClassSerializerInterceptor,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { CreateUserDto } from '@src/user/dtos/request/create-user.dto';
import request from 'supertest';
import { HttpExceptionFilter } from '@src/common/filters/http-api-exception.filter';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';

describe('USER (e2e)', () => {
  let app: INestApplication;
  let access_token: string;
  let refresh_token: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users/signup [POST]', () => {
    it('회원가입 성공 - 정상적인 호출', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'a@a.com',
          password: '1234',
          nickname: 'asd1',
          phone: '01099493276',
        })
        .expect(HttpStatus.CREATED);
    });
  });
});
