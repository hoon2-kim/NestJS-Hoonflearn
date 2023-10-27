import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/auth/auth.service';
import { UserService } from '@src/user/user.service';
import {
  mockJwtService,
  mockLoginUserDto,
  mockUserService,
} from '@test/__mocks__/auth.mock';
import { mockCreatedUser } from '@test/__mocks__/user.mock';
import bcryptjs from 'bcryptjs';
import { Request, Response } from 'express';
import { IAuthLogin } from '../interfaces/auth.interface';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  const mockAccessToken = 'access';
  const mockRefreshToken = 'refresh';
  const mockRtHash = 'hash_refresh';
  const userId = 'uuid';
  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('[로그인]', () => {
    const mockLoginResponse: IAuthLogin = {
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
      jest.spyOn(authService, 'hashData').mockResolvedValue(mockRtHash);
      jest
        .spyOn(userService, 'updateRefreshToken')
        .mockResolvedValue(undefined);

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
      expect(userService.updateRefreshToken).toBeCalledWith(
        mockCreatedUser.id,
        mockRtHash,
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
        .spyOn(userService, 'removeRefreshToken')
        .mockResolvedValue(undefined);

      const result = await authService.logout(userId, mockResponse);

      expect(result).toBe('로그아웃 성공');
      expect(mockResponse.cookie).toBeCalledWith('refreshToken', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        path: '/',
        expires: new Date(0),
      });
      expect(userService.removeRefreshToken).toBeCalled();
      expect(userService.removeRefreshToken).toBeCalledWith(userId);
    });

    it('로그아웃 실패 - 모종의 이유로 실패(500에러)', async () => {
      jest
        .spyOn(userService, 'removeRefreshToken')
        .mockResolvedValue(undefined);

      try {
        await authService.logout(userId, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.message).toBe('로그아웃 실패');
      }
    });
  });

  describe('[AccessToken 복구]', () => {
    const mockNewAt = 'new_at';
    const mockRequest = {
      cookies: {
        refreshToken: '',
      },
    } as unknown as Request;

    it('새로운 access_token 발급 성공', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedUser);
      jest.spyOn(bcryptjs, 'compare').mockImplementation(() => true);
      jest.spyOn(authService, 'getAccessToken').mockReturnValue(mockNewAt);

      const result = await authService.restore(userId, mockRequest);

      expect(result).toEqual({ access_token: mockNewAt });
    });

    it('발급 실패 - DB와 쿠키의 토큰이 다른 경우(403에러)', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedUser);
      jest.spyOn(bcryptjs, 'compare').mockImplementation(() => false);

      try {
        await authService.restore(userId, mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(
          'DB의 refreshToken과 쿠키의 refreshToken이 다릅니다.',
        );
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
