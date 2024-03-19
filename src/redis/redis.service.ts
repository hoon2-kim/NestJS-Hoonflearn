import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    return await this.redis.set(key, value, 'EX', ttl);
  }

  async get(key: string): Promise<string | null> {
    const data = await this.redis.get(key);

    if (data) {
      return data;
    } else {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
