import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
  RATE_LIMIT_METADATA_KEY,
  RateLimitOptions,
} from './rate-limit.decorator';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitBucket>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const now = Date.now();
    const key = `${options.keyPrefix}:${this.getClientIp(request)}`;
    const bucket = this.getBucket(key, options, now);
    const remaining = Math.max(options.limit - bucket.count, 0);

    this.setRateLimitHeaders(response, options, bucket, remaining);

    if (bucket.count >= options.limit) {
      response.setHeader(
        'Retry-After',
        Math.ceil((bucket.resetAt - now) / 1000).toString(),
      );
      throw new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.count += 1;
    this.setRateLimitHeaders(
      response,
      options,
      bucket,
      Math.max(options.limit - bucket.count, 0),
    );

    return true;
  }

  private getBucket(
    key: string,
    options: RateLimitOptions,
    now: number,
  ): RateLimitBucket {
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      const newBucket = {
        count: 0,
        resetAt: now + options.windowMs,
      };
      this.buckets.set(key, newBucket);
      return newBucket;
    }

    return bucket;
  }

  private setRateLimitHeaders(
    response: Response,
    options: RateLimitOptions,
    bucket: RateLimitBucket,
    remaining: number,
  ): void {
    response.setHeader('X-RateLimit-Limit', options.limit.toString());
    response.setHeader('X-RateLimit-Remaining', remaining.toString());
    response.setHeader(
      'X-RateLimit-Reset',
      Math.ceil(bucket.resetAt / 1000).toString(),
    );
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.get('x-forwarded-for');

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
