import { Test, TestingModule } from '@nestjs/testing';
import { CoolsmsService } from './coolsms.service';
import { createMock } from '@golevelup/ts-jest';

describe('CoolsmsService', () => {
  let service: CoolsmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoolsmsService],
    }).compile();

    service = module.get<CoolsmsService>(CoolsmsService);
  });

  it('should be defined', () => {
    const qqq = createMock<CoolsmsService>();

    expect(service).toBeDefined();
  });
});
