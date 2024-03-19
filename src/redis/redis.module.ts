import { Module } from '@nestjs/common';
import { RedisModule as _RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from '@src/redis/redis.service';

@Module({
  imports: [
    _RedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          config: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      true,
    ),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
