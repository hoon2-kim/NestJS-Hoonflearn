import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomRedisService } from '@src/redis/redis.service';

@Module({
  imports: [
    RedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          readyLog: true,
          config: [
            {
              namespace: 'auth-redis',
              host: configService.get<string>('REDIS_HOST'),
              port: configService.get<number>('REDIS_PORT'),
              db: 0,
            },
            {
              namespace: 'coupon-redis',
              host: configService.get<string>('REDIS_HOST'),
              port: configService.get<number>('REDIS_PORT'),
              db: 1,
            },
          ],
        }),
        inject: [ConfigService],
      },
      true,
    ),
  ],
  providers: [CustomRedisService],
  exports: [CustomRedisService],
})
export class CustomRedisModule {}
