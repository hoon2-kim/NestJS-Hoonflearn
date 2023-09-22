import { Module } from '@nestjs/common';
import { CacheService } from '@src/cache/cache.service';
import { CacheModule as CacheModule_ } from '@nestjs/cache-manager';
import { redisCacheConfig } from '@src/config/redis';

@Module({
  imports: [CacheModule_.registerAsync(redisCacheConfig)],
  providers: [CacheService],
})
export class CacheModule {}
