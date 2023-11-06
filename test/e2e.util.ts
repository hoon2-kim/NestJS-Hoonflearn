import { INestApplication } from '@nestjs/common';
import { LoginUserDto } from '@src/auth/dtos/request/login-user.dto';
import { CreateUserDto } from '@src/user/dtos/request/create-user.dto';
import request from 'supertest';

export async function login(app: INestApplication, dto: LoginUserDto) {
  return await request(app.getHttpServer()) //
    .post('/auth/login')
    .send(dto);
}

export async function signUp(app: INestApplication, dto: CreateUserDto) {
  return await request(app.getHttpServer()) //
    .post('/users/signup')
    .send(dto);
}
