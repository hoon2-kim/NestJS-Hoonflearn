import { Test, TestingModule } from '@nestjs/testing';
import { VoucherController } from '@src/voucher/voucher.controller';
import { VoucherService } from '@src/voucher/voucher.service';

describe('VoucherController', () => {
  let controller: VoucherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherController],
      providers: [VoucherService],
    }).compile();

    controller = module.get<VoucherController>(VoucherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
