import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class CustomRedisService {
  constructor(
    @InjectRedis('auth-redis')
    private readonly authRedis: Redis,

    @InjectRedis('coupon-redis')
    private readonly couponRedis: Redis,
  ) {}

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    return await this.authRedis.set(key, value, 'EX', ttl);
  }

  async get(key: string): Promise<string | null> {
    const data = await this.authRedis.get(key);

    if (data) {
      return data;
    } else {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.authRedis.del(key);
  }

  async hGetAll(key: string) {
    return await this.couponRedis.hgetall(key);
  }

  async hGet(key: string, field: string) {
    return await this.couponRedis.hget(key, field);
  }

  async hSet(key: string, value: Record<string, any>) {
    return await this.couponRedis.hset(key, value);
  }

  async hDel(key: string) {
    return await this.couponRedis.hdel(key);
  }

  async sAdd(key: string, value: string) {
    return await this.couponRedis.sadd(key, value);
  }

  async sCard(key: string) {
    return await this.couponRedis.scard(key);
  }

  async sIsMember(key: string, value: string) {
    return await this.couponRedis.sismember(key, value);
  }

  async luaExcute(script: string, keys: string[], args: string[]) {
    return await this.couponRedis.eval(script, keys.length, ...keys, ...args);
  }
}
