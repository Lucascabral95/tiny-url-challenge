import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { envs } from '../../../config/env.schema';

const URL_CACHE_TTL_SECONDS = 86_400;

@Injectable()
export class UrlCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(UrlCacheService.name);
  private readonly redis = new Redis({
    host: envs.redisHost,
    port: envs.redisPort,
    maxRetriesPerRequest: 1,
  });

  constructor() {
    this.redis.on('error', (error) => {
      this.logger.warn(`Redis connection error: ${this.formatError(error)}`);
    });
  }

  async getOriginalUrl(code: string): Promise<string | null> {
    try {
      return await this.redis.get(this.buildKey(code));
    } catch (error) {
      this.logger.warn(`Redis read failed: ${this.formatError(error)}`);
      return null;
    }
  }

  async setOriginalUrl(code: string, originalUrl: string): Promise<void> {
    try {
      await this.redis.set(
        this.buildKey(code),
        originalUrl,
        'EX',
        URL_CACHE_TTL_SECONDS,
      );
    } catch (error) {
      this.logger.warn(`Redis write failed: ${this.formatError(error)}`);
    }
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }

  private buildKey(code: string): string {
    return `tiny-url:${code}`;
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'unknown error';
  }
}
