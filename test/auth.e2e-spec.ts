import {
  ClassSerializerInterceptor,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { CreateUserDto } from '@src/user/dtos/create-user.dto';
import request from 'supertest';
import { HttpExceptionFilter } from '@src/common/filters/http-api-exception.filter';
import cookieParser from 'cookie-parser';
import { parse } from 'cookie';
import { DataSource } from 'typeorm';
import { ResponseInterceptor } from '@src/common/interceptors/response-interceptor';

const userDto: CreateUserDto = {
  email: 'test@test.com',
  password: '1234',
  nickname: 'test',
};

describe('AUTH (e2e)', () => {
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
      new ResponseInterceptor(),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  function signUp(userDto: CreateUserDto) {
    return request(app.getHttpServer()).post('/users/signup').send(userDto);
  }

  function login(email: string, password: string) {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
  }

  describe('/auth/login [POST]', () => {
    beforeEach(async () => {
      await signUp(userDto);
    });

    it('로그인 성공 - access_token, refresh_token 반환', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: userDto.password,
        })
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body.data.access_token).toBeDefined();
          expect(res.body.data.refresh_token).toBeDefined();

          const cookie = res.headers['set-cookie'][0];

          expect(cookie).toContain('Path=/');
          expect(cookie).toContain('HttpOnly');
          expect(cookie).toContain('SameSite=None');
        });
    });

    it('로그인 실패 - 가입을 안한 경우(401에러)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test1@test.com',
          password: userDto.password,
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.error).toStrictEqual({
            statusCode: 401,
            message: '유저가 존재하지 않습니다.',
            error: 'Unauthorized',
          });
        });
    });

    it('로그인 실패 - 비밀번호가 틀린 경우(401에러)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: '12345',
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.error).toStrictEqual({
            statusCode: 401,
            message: '비밀번호가 틀렸습니다.',
            error: 'Unauthorized',
          });
        });
    });
  });

  describe('/auth/logout [POST]', () => {
    beforeEach(async () => {
      await signUp(userDto);
      const loginResponse = await login(userDto.email, userDto.password);

      access_token = loginResponse.body.data.access_token;
    });

    it('로그아웃 성공 - refresh_token 쿠키에서는 빈값 및 만료시간 과거 확인', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set({ Authorization: `Bearer ${access_token}` })
        .expect(HttpStatus.CREATED)
        .then((res) => {
          const parseCookie = parse(res.headers['set-cookie'][0]);

          expect(parseCookie['refreshToken']).toBe('');
          expect(
            new Date(parseCookie['Expires']).getTime(),
          ).toBeLessThanOrEqual(new Date().getTime());
        });
    });
  });

  describe('/auth/refresh [POST]', () => {
    beforeEach(async () => {
      await signUp(userDto);
      const loginResponse = await login(userDto.email, userDto.password);

      refresh_token = loginResponse.body.data.refresh_token;
    });

    it('토큰 재발급 성공 - refresh_token으로 access_token 발급', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refreshToken=${refresh_token}`)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body.data.access_token).toBeDefined();
        });
    });

    it('토큰 재발급 실패 - 유효한 refresh_token이 아닌 경우 401에러', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refreshToken=invalidRefresh`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
