import { Test, TestingModule } from '@nestjs/testing';
import { CoolsmsService } from './coolsms.service';

describe('CoolsmsService', () => {
  let coolSMSservice: CoolsmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoolsmsService],
    }).compile();

    coolSMSservice = module.get<CoolsmsService>(CoolsmsService);
  });

  it('should be defined', () => {
    expect(coolSMSservice).toBeDefined();
  });
});
