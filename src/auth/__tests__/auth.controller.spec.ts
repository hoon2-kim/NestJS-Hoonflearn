import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@src/auth/auth.controller';
import { AuthService } from '@src/auth/auth.service';
import { mockAuthService } from '@test/__mocks__/mock-service';
import { Request, Response } from 'express';
import { IAuthToken } from '@src/auth/interfaces/auth.interface';
import {
  mockGoogleTokenDto,
  mockJwtPayload,
  mockJwtTokens,
  mockLoginUserDto,
  mockUserByGoogle,
} from '@test/__mocks__/mock-data';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as Response;
  const mockRequest = {
    cookies: {
      refreshToken: 'refresh',
    },
  } as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('[AuthController.loginUser] - 로그인', () => {
    it('로그인 성공', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(mockJwtTokens);

      const result = await authController.loginUser(
        mockLoginUserDto,
        mockResponse,
      );

      expect(result).toEqual(mockJwtTokens);
      expect(authService.login).toBeCalled();
      expect(authService.login).toBeCalledWith(mockLoginUserDto, mockResponse);
    });
  });

  describe('[AuthController.logoutUser] - 로그아웃', () => {
    it('로그아웃 성공', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      const result = await authController.logoutUser(
        mockJwtPayload,
        mockResponse,
      );

      expect(result).toBeUndefined();
      expect(authService.logout).toBeCalled();
      expect(authService.logout).toBeCalledWith(mockJwtPayload, mockResponse);
    });
  });

  describe('[AuthController.restoreAccessToken] - access_token 만료시 재발급', () => {
    it('재발급 성공', async () => {
      const mockRestoreResponse: IAuthToken = {
        access_token: 'new_access',
        refresh_token: 'new_refresh',
      };
      const mockReqCookie = mockRequest.cookies.refreshToken;

      jest.spyOn(authService, 'restore').mockResolvedValue(mockRestoreResponse);

      const result = await authController.restoreAccessToken(
        mockRequest,
        mockResponse,
      );

      expect(result).toEqual(mockRestoreResponse);
      expect(authService.restore).toBeCalled();
      expect(authService.restore).toBeCalledWith(mockReqCookie, mockResponse);
    });
  });

  describe('[AuthController.googleLogin] - 소셜 로그인(구글)', () => {
    it('구글 로그인 성공 - 첫 로그인', async () => {
      jest.spyOn(authService, 'socialLogin').mockResolvedValue({
        user: mockUserByGoogle,
        tokens: mockJwtTokens,
      });

      const result = await authController.googleLogin(
        mockGoogleTokenDto,
        mockResponse,
      );

      expect(result).toEqual({
        user: mockUserByGoogle,
        tokens: mockJwtTokens,
      });
      expect(authService.socialLogin).toBeCalled();
      expect(authService.socialLogin).toBeCalledWith(
        mockGoogleTokenDto,
        mockResponse,
      );
    });
  });

  it('구글 로그인 성공 - 첫 로그인이 아닌 경우', async () => {
    jest.spyOn(authService, 'socialLogin').mockResolvedValue(mockJwtTokens);

    const result = await authController.googleLogin(
      mockGoogleTokenDto,
      mockResponse,
    );

    expect(result).toEqual(mockJwtTokens);
    expect(authService.socialLogin).toBeCalled();
    expect(authService.socialLogin).toBeCalledWith(
      mockGoogleTokenDto,
      mockResponse,
    );
  });
});
