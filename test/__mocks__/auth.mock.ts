import { LoginUserDto } from '@src/auth/dtos/request/login-user.dto';

export const mockLoginUserDto: LoginUserDto = {
  email: 'a@a.com',
  password: '1234',
};

export const mockJwtService = {
  sign: jest.fn(),
};

export const mockUserService = {
  findOneByOptions: jest.fn(),
  updateRefreshToken: jest.fn(),
  removeRefreshToken: jest.fn(),
};

export const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  restore: jest.fn(),
};
