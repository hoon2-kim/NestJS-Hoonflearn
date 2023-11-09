import { LoginUserDto } from '@src/auth/dtos/request/login-user.dto';

export const mockLoginUserDto: LoginUserDto = {
  email: 'a@a.com',
  password: '1234',
};

export const mockJwtService = {
  sign: jest.fn(),
  verifyAsync: jest.fn(),
};

export const mockUserService = {
  findOneByOptions: jest.fn(),
};

export const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  restore: jest.fn(),
};

export const mockJwtRedisService = {
  setRefreshToken: jest.fn(),
  getRefreshToken: jest.fn(),
  delRefreshToken: jest.fn(),
};
