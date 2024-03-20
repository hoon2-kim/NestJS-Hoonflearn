import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/auth/auth.service';
import { UserService } from '@src/user/user.service';
import bcryptjs from 'bcryptjs';
import { Response } from 'express';
import { RedisService } from '@src/redis/redis.service';
import {
  mockJwtService,
  mockRedisService,
  mockUserService,
} from '@test/__mocks__/mock-service';
import { jwtRefreshTokenKey } from '@src/redis/keys';
import { ERoleType } from '@src/user/enums/user.enum';
import {
  mockUserByEmail,
  mockUserByGoogle,
  mockGoogleTokenDto,
  mockJwtPayload,
  mockJwtTokens,
  mockLoginUserDto,
} from '@test/__mocks__/mock-data';

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(() => ({
    verifyIdToken: jest.fn(async () => ({
      getPayload: jest.fn(() => ({
        sub: '',
        iss: '',
        azp: '',
        aud: '',
        email: 'test@gmail.com',
        email_verified: true,
        name: 'test',
        at_hash: '',
        picture: 'https://test.com',
        given_name: '',
        family_name: '',
        locale: 'ko',
        iat: 1710393865,
        exp: 1710397465,
      })),
    })),
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  let redisService: RedisService;

  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  describe('[로그인]', () => {
    it('로그인 성공', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockUserByEmail);
      jest.spyOn(bcryptjs, 'compare').mockImplementation(() => true);
      jest.spyOn(authService, 'getJwtTokens').mockResolvedValue(mockJwtTokens);

      const result = await authService.login(mockLoginUserDto, mockResponse);

      expect(result).toEqual(mockJwtTokens);
      expect(authService.getJwtTokens).toBeCalledWith({
        id: mockUserByEmail.id,
        email: mockUserByEmail.email,
        role: mockUserByEmail.role,
      });
      expect(redisService.set).toBeCalledWith(
        jwtRefreshTokenKey(mockUserByEmail.email),
        mockJwtTokens.refresh_token,
        expect.any(Number),
      );
      expect(mockResponse.cookie).toBeCalledWith(
        'refreshToken',
        mockJwtTokens.refresh_token,
        {
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'none',
          path: '/',
          maxAge: expect.any(Number),
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
        .mockResolvedValue(mockUserByEmail);
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
      const result = await authService.logout(mockJwtPayload, mockResponse);

      expect(result).toBeUndefined();
      expect(mockResponse.cookie).toBeCalledWith('refreshToken', '', {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: 'none',
        path: '/',
        expires: new Date(0),
      });
      expect(redisService.get).toBeCalled();
      expect(redisService.get).toBeCalledWith(
        jwtRefreshTokenKey(mockJwtPayload.email),
      );
      expect(redisService.del).toBeCalled();
      expect(redisService.del).toBeCalledWith(
        jwtRefreshTokenKey(mockJwtPayload.email),
      );
    });

    it('로그아웃 실패 - 이미 로그아웃한 경우(401에러)', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);

      try {
        await authService.logout(mockJwtPayload, mockResponse);
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
      jest.spyOn(authService, 'getJwtTokens').mockResolvedValue(mockJwtTokens);

      const result = await authService.restore('refresh_token', mockResponse);

      expect(result).toEqual(mockJwtTokens);
      expect(authService.getJwtTokens).toBeCalledWith({
        id: mockDecoded.id,
        email: mockDecoded.email,
        role: mockDecoded.role,
      });
      expect(redisService.set).toBeCalledWith(
        jwtRefreshTokenKey(mockDecoded.email),
        mockJwtTokens.refresh_token,
        expect.any(Number),
      );
    });

    it('발급 실패 - 이미 로그아웃 한 경우(401에러)', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecoded);
      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);

      try {
        await authService.restore('refresh_token', mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('발급 실패 - redis에 저장된 refresh토큰과 유저의 refresh토큰이 다른 경우(401에러)', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecoded);

      try {
        await authService.restore('invalid_refresh_token', mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(mockResponse.cookie).toBeCalledWith('refreshToken', '', {
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'none',
          path: '/',
          expires: new Date(0),
        });
      }
    });
  });

  describe('[소셜로그인 - 구글]', () => {
    it('구글 첫 로그인 성공 + 회원가입', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockUserByGoogle);
      jest.spyOn(authService, 'getJwtTokens').mockResolvedValue(mockJwtTokens);

      const result = await authService.socialLogin(
        mockGoogleTokenDto,
        mockResponse,
      );

      expect(result).toEqual({
        user: mockUserByGoogle,
        tokens: mockJwtTokens,
      });
      expect(mockResponse.cookie).toBeCalledWith(
        'refreshToken',
        mockJwtTokens.refresh_token,
        {
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'none',
          path: '/',
          maxAge: expect.any(Number),
        },
      );
    });

    it('구글 로그인 성공(첫 로그인이 아닌 경우), 회원가입 안되야함', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockUserByGoogle);
      jest.spyOn(authService, 'getJwtTokens').mockResolvedValue(mockJwtTokens);

      const result = await authService.socialLogin(
        mockGoogleTokenDto,
        mockResponse,
      );

      expect(result).toEqual(mockJwtTokens);
      expect(mockResponse.cookie).toBeCalledWith(
        'refreshToken',
        mockJwtTokens.refresh_token,
        {
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'none',
          path: '/',
          maxAge: expect.any(Number),
        },
      );
      expect(userService.create).toBeCalledTimes(0);
    });

    it('구글 로그인 실패 - 해당 이메일로 이미 일반가입 한 경우(400에러)', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockUserByEmail);

      try {
        await authService.socialLogin(mockGoogleTokenDto, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
