import { Module } from '@nestjs/common';
import { CoolsmsService } from './coolsms.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CoolsmsService],
  exports: [CoolsmsService],
})
export class CoolsmsModule {}
