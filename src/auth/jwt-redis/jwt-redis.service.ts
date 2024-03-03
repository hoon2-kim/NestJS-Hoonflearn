import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRedisService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,

    private readonly configService: ConfigService,
  ) {}

  async setRefreshToken(key: string, value: string): Promise<'OK'> {
    key = `RT:${key}`;
    const ttl = this.configService.get<number>('JWT_RT_SECONDS');

    return await this.redis.set(key, value, 'EX', ttl);
  }

  async getRefreshToken(key: string): Promise<string | null> {
    key = `RT:${key}`;

    const data = await this.redis.get(key);

    if (data) {
      return data;
    } else {
      return null;
    }
  }

  async delRefreshToken(key: string): Promise<void> {
    key = `RT:${key}`;
    await this.redis.del(key);
  }
}
