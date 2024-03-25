import { Test, TestingModule } from '@nestjs/testing';
import { VoucherController } from '@src/voucher/voucher.controller';
import { VoucherService } from '@src/voucher/voucher.service';
import {
  mockCourseUserWithFree,
  mockCreateVoucherDto,
} from '@test/__mocks__/mock-data';
import { mockVoucherService } from '@test/__mocks__/mock-service';

describe('VoucherController', () => {
  let voucherController: VoucherController;
  let voucherService: VoucherService;

  const courseId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherController],
      providers: [{ provide: VoucherService, useValue: mockVoucherService }],
    }).compile();

    voucherController = module.get<VoucherController>(VoucherController);
    voucherService = module.get<VoucherService>(VoucherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(voucherController).toBeDefined();
    expect(voucherService).toBeDefined();
  });

  describe('[VoucherController.registerFreeCourse] - 무료강의 수강 신청', () => {
    it('수강 신청 성공', async () => {
      jest
        .spyOn(voucherService, 'create')
        .mockResolvedValue(mockCourseUserWithFree);

      const result = await voucherController.registerFreeCourse(
        mockCreateVoucherDto,
        userId,
      );

      expect(result).toEqual(mockCourseUserWithFree);
      expect(voucherService.create).toHaveBeenCalled();
      expect(voucherService.create).toBeCalledWith(
        mockCreateVoucherDto,
        userId,
      );
    });
  });

  describe('[VoucherController.cancelFreeCourse] - 무료강의 수강 신청 취소', () => {
    it('수강 신청 취소 성공', async () => {
      jest.spyOn(voucherService, 'delete').mockResolvedValue(undefined);

      const result = await voucherController.cancelFreeCourse(courseId, userId);

      expect(result).toBeUndefined();
      expect(voucherService.delete).toHaveBeenCalled();
      expect(voucherService.delete).toBeCalledWith(courseId, userId);
    });
  });
});
