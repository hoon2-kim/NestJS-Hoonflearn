import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@src/auth/auth.controller';
import { AuthService } from '@src/auth/auth.service';
import { mockAuthService, mockLoginUserDto } from '@test/__mocks__/auth.mock';
import { IAuthLogin, IAuthRestore } from '@src/auth/interfaces/auth.interface';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const mockRequest = {
    cookies: {
      refreshToken: '',
    },
  } as unknown as Request;
  const userId = 'uuid';

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
      const mockLoginResponse: IAuthLogin = {
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

      const result = await authController.logoutUser(userId, mockResponse);

      expect(result).toBe('로그아웃 성공');
      expect(authService.logout).toBeCalled();
      expect(authService.logout).toBeCalledWith(userId, mockResponse);
    });
  });

  describe('[AuthController.restoreAccessToken] - access_token 만료시 재발급', () => {
    it('재발급 성공', async () => {
      const mockRestoreResponse: IAuthRestore = {
        access_token: 'acess',
      };
      jest.spyOn(authService, 'restore').mockResolvedValue(mockRestoreResponse);

      const result = await authController.restoreAccessToken(
        userId,
        mockRequest,
      );

      expect(result).toEqual(mockRestoreResponse);
      expect(authService.restore).toBeCalled();
      expect(authService.restore).toBeCalledWith(userId, mockRequest);
    });
  });
});
