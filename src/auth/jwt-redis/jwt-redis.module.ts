import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtRedisService } from '@src/auth/jwt-redis/jwt-redis.service';

@Module({
  imports: [
    RedisModule.forRootAsync(
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
  providers: [JwtRedisService],
  exports: [JwtRedisService],
})
export class JwtRedisModule {}
