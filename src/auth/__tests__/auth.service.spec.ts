import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/auth/auth.service';
import { UserService } from '@src/user/user.service';
import {
  mockJwtRedisService,
  mockJwtService,
  mockLoginUserDto,
  mockUserService,
} from '@test/__mocks__/auth.mock';
import { mockCreatedUser } from '@test/__mocks__/user.mock';
import bcryptjs from 'bcryptjs';
import { Response } from 'express';
import { JwtRedisService } from '@src/auth/jwt-redis/jwt-redis.service';
import { IAuthToken } from '@src/auth/interfaces/auth.interface';
import { ERoleType } from '@src/user/enums/user.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  let jwtRedisService: JwtRedisService;

  const mockAccessToken = 'access';
  const mockRefreshToken = 'refresh';
  const mockNewAt = 'new_at';
  const mockNewRt = 'new_rt';
  const user = mockCreatedUser;
  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
        { provide: JwtRedisService, useValue: mockJwtRedisService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    jwtRedisService = module.get<JwtRedisService>(JwtRedisService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtRedisService).toBeDefined();
  });

  describe('[로그인]', () => {
    const mockLoginResponse: IAuthToken = {
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
    };

    it('로그인 성공', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedUser);
      jest.spyOn(bcryptjs, 'compare').mockImplementation(() => true);
      jest
        .spyOn(authService, 'getAccessToken')
        .mockReturnValue(mockAccessToken);
      jest
        .spyOn(authService, 'getRefreshToken')
        .mockReturnValue(mockRefreshToken);
      jest.spyOn(jwtRedisService, 'setRefreshToken').mockResolvedValue('OK');

      const result = await authService.login(mockLoginUserDto, mockResponse);

      expect(result).toEqual(mockLoginResponse);
      expect(authService.getAccessToken).toBeCalledWith(
        mockCreatedUser.id,
        mockCreatedUser.email,
        mockCreatedUser.role,
      );
      expect(authService.getRefreshToken).toBeCalledWith(
        mockCreatedUser.id,
        mockCreatedUser.email,
        mockCreatedUser.role,
      );
      expect(jwtRedisService.setRefreshToken).toBeCalledWith(
        mockLoginUserDto.email,
        mockRefreshToken,
      );
      expect(mockResponse.cookie).toBeCalledWith(
        'refreshToken',
        mockRefreshToken,
        {
          httpOnly: true,
          secure: false,
          sameSite: 'none',
          path: '/',
        },
      );
    });

    it('로그인 실패 - 회원가입 안한 경우(401에러)', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await authService.login(mockLoginUserDto, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('유저가 존재하지 않습니다.');
      }
    });

    it('로그인 실패 - 비밀번호가 틀린 경우(401에러)', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedUser);
      jest.spyOn(bcryptjs, 'compare').mockImplementation(() => false);

      try {
        await authService.login(mockLoginUserDto, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('비밀번호가 틀렸습니다.');
      }
    });
  });

  describe('[로그아웃]', () => {
    it('로그아웃 성공', async () => {
      jest
        .spyOn(jwtRedisService, 'getRefreshToken')
        .mockResolvedValue(mockRefreshToken);
      jest
        .spyOn(jwtRedisService, 'delRefreshToken')
        .mockResolvedValue(undefined);

      const result = await authService.logout(user, mockResponse);

      expect(result).toBe('로그아웃 성공');
      expect(mockResponse.cookie).toBeCalledWith('refreshToken', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        path: '/',
        expires: new Date(0),
      });
      expect(jwtRedisService.getRefreshToken).toBeCalled();
      expect(jwtRedisService.getRefreshToken).toBeCalledWith(user.email);
      expect(jwtRedisService.delRefreshToken).toBeCalled();
      expect(jwtRedisService.getRefreshToken).toBeCalledWith(user.email);
    });

    it('로그아웃 실패 - 이미 로그아웃한 경우(401에러)', async () => {
      jest.spyOn(jwtRedisService, 'getRefreshToken').mockResolvedValue(null);

      try {
        await authService.logout(user, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('이미 로그아웃 하셨습니다.');
      }
    });
  });

  describe('[AccessToken 복구]', () => {
    const mockDecoded = {
      id: 'uuid',
      email: 'a@a.com',
      role: ERoleType.User,
      iat: 1699515836,
      exp: 1700725436,
    };

    it('새로운 access_token 발급 및 refresh_token 성공', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecoded);
      jest
        .spyOn(jwtRedisService, 'getRefreshToken')
        .mockResolvedValue(mockRefreshToken);
      jest.spyOn(authService, 'getAccessToken').mockReturnValue(mockNewAt);
      jest.spyOn(authService, 'getRefreshToken').mockReturnValue(mockNewRt);
      jest.spyOn(jwtRedisService, 'setRefreshToken').mockResolvedValue('OK');

      const result = await authService.restore(mockRefreshToken);

      expect(result).toEqual({
        access_token: mockNewAt,
        refresh_token: mockNewRt,
      });
    });

    it('발급 실패 - invalid한 refresh_token인 경우(401에러)', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecoded);
      jest
        .spyOn(jwtRedisService, 'getRefreshToken')
        .mockRejectedValue(new UnauthorizedException());

      try {
        await authService.restore(mockRefreshToken);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('[access_token 생성]', () => {
    it('access_token 생성 성공', () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockAccessToken);

      const result = authService.getAccessToken(
        mockCreatedUser.id,
        mockCreatedUser.email,
        mockCreatedUser.role,
      );

      expect(result).toBe(mockAccessToken);
    });
  });

  describe('[refresh_token 생성]', () => {
    it('refresh_token 생성 성공', () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockRefreshToken);

      const result = authService.getRefreshToken(
        mockCreatedUser.id,
        mockCreatedUser.email,
        mockCreatedUser.role,
      );

      expect(result).toBe(mockRefreshToken);
    });
  });
});
