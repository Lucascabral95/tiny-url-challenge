import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { envs } from '../../../config/env.schema';

const URL_CACHE_TTL_SECONDS = 86_400;
const REDIS_CACHE_COMMAND_TIMEOUT_MS = 500;
const REDIS_CACHE_CIRCUIT_BREAKER_COOLDOWN_MS = 30_000;

@Injectable()
export class UrlCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(UrlCacheService.name);
  private unavailableUntil = 0;
  private readonly redis = new Redis({
    host: envs.redisHost,
    port: envs.redisPort,
    connectTimeout: REDIS_CACHE_COMMAND_TIMEOUT_MS,
    commandTimeout: REDIS_CACHE_COMMAND_TIMEOUT_MS,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });

  constructor() {
    this.redis.on('error', (error) => {
      this.logger.warn(`Redis connection error: ${this.formatError(error)}`);
    });
  }

  async getOriginalUrl(code: string): Promise<string | null> {
    if (this.isCircuitOpen()) {
      return null;
    }

    try {
      return await this.redis.get(this.buildKey(code));
    } catch (error) {
      this.openCircuit('read', error);
      return null;
    }
  }

  async setOriginalUrl(code: string, originalUrl: string): Promise<void> {
    if (this.isCircuitOpen()) {
      return;
    }

    try {
      await this.redis.set(
        this.buildKey(code),
        originalUrl,
        'EX',
        URL_CACHE_TTL_SECONDS,
      );
    } catch (error) {
      this.openCircuit('write', error);
    }
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }

  private buildKey(code: string): string {
    return `tiny-url:${code}`;
  }

  private isCircuitOpen(): boolean {
    return Date.now() < this.unavailableUntil;
  }

  private openCircuit(operation: 'read' | 'write', error: unknown): void {
    this.unavailableUntil =
      Date.now() + REDIS_CACHE_CIRCUIT_BREAKER_COOLDOWN_MS;

    this.logger.warn(
      `Redis cache ${operation} failed; bypassing cache for ${REDIS_CACHE_CIRCUIT_BREAKER_COOLDOWN_MS}ms: ${this.formatError(error)}`,
    );
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'unknown error';
  }
}
