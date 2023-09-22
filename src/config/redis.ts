import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

// 호환성 문제로 임해 임시 사용
import { redisStore } from 'cache-manager-redis-yet';

export const redisCacheConfig = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<CacheModuleOptions> => ({
    store: await redisStore({
      // url: configService.get('REDIS_URI'),
      socket: {
        port: configService.get('REDIS_PORT'),
        host: configService.get('REDIS_HOST'),
      },
    }),
    isGlobal: true,
  }),
  inject: [ConfigService],
};
