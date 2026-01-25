import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ||
      this.configService.get<string>('REDIS_HOST')
        ? `redis://${this.configService.get<string>('REDIS_HOST')}:${this.configService.get<number>('REDIS_PORT') || 6379}`
        : 'redis://localhost:6379';

    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const data = await this.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET JSON error:', error);
      return null;
    }
  }

  async setJSON(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      await this.set(key, JSON.stringify(value), ttlSeconds);
    } catch (error) {
      console.error('Redis SET JSON error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis DELETE error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
