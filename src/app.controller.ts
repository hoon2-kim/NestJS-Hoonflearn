import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  ping() {
    // throw new InternalServerErrorException('500 에러 테스트');
    // throw new BadRequestException('에러 테스트');
    return 'pong';
  }
}
