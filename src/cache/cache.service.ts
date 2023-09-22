import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  //   async get(key: string) {
  //     return this.cacheManager.get(key);
  //   }

  //   async set(key: string, value: string, ttl?: number) {
  //     return this.cacheManager.set(key, value, ttl);
  //   }

  //   async del(key: string) {
  //     return this.cacheManager.del(key);
  //   }
}
