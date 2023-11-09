import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@src/auth/auth.controller';
import { AuthService } from '@src/auth/auth.service';
import { mockAuthService, mockLoginUserDto } from '@test/__mocks__/auth.mock';
import { Request, Response } from 'express';
import { mockCreatedUser } from '@test/__mocks__/user.mock';
import { IAuthToken } from '../interfaces/auth.interface';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const mockRequest = {
    cookies: {
      refreshToken: 'refresh',
    },
  } as unknown as Request;
  const user = mockCreatedUser;

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
      const mockLoginResponse: IAuthToken = {
        access_token: 'access',
        refresh_token: 'refresh',
      };
      jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResponse);

      const result = await authController.loginUser(
        mockLoginUserDto,
        mockResponse,
      );

      expect(result).toEqual(mockLoginResponse);
      expect(authService.login).toBeCalled();
      expect(authService.login).toBeCalledWith(mockLoginUserDto, mockResponse);
    });
  });

  describe('[AuthController.logoutUser] - 로그아웃', () => {
    it('로그아웃 성공', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue('로그아웃 성공');

      const result = await authController.logoutUser(user, mockResponse);

      expect(result).toBe('로그아웃 성공');
      expect(authService.logout).toBeCalled();
      expect(authService.logout).toBeCalledWith(user, mockResponse);
    });
  });

  describe('[AuthController.restoreAccessToken] - access_token 만료시 재발급', () => {
    it('재발급 성공', async () => {
      const mockRestoreResponse: IAuthToken = {
        access_token: 'acess',
        refresh_token: 'refresh',
      };
      jest.spyOn(authService, 'restore').mockResolvedValue(mockRestoreResponse);

      const result = await authController.restoreAccessToken(mockRequest);

      expect(result).toEqual(mockRestoreResponse);
      expect(authService.restore).toBeCalled();
      expect(authService.restore).toBeCalledWith(
        mockRequest.cookies.refreshToken,
      );
    });
  });
});
