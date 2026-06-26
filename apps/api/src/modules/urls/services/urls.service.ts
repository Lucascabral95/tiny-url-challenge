import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { envs } from '../../../config/env.schema';
import { ClickEventsProducer } from '../../click-events/producers/click-events.producer';
import { ClickEventsOutboxRepository } from '../../click-events/repositories/click-events-outbox.repository';
import { MAX_SHORT_CODE_GENERATION_ATTEMPTS } from '../urls.constants';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { UrlStatsRepository } from '../repositories/url-stats.repository';
import { UrlsRepository } from '../repositories/urls.repository';
import { ShortCodeGeneratorService } from './short-code-generator.service';
import { UrlCacheService } from './url-cache.service';

export interface CreateShortUrlResponse {
  code: string;
  originalUrl: string;
  shortUrl: string;
}

export interface ResolveShortUrlMetadata {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class UrlsService {
  private readonly logger = new Logger(UrlsService.name);

  constructor(
    private readonly urlsRepository: UrlsRepository,
    private readonly urlStatsRepository: UrlStatsRepository,
    private readonly shortCodeGenerator: ShortCodeGeneratorService,
    private readonly urlCacheService: UrlCacheService,
    private readonly clickEventsProducer: ClickEventsProducer,
    private readonly clickEventsOutboxRepository: ClickEventsOutboxRepository,
  ) {}

  async createShortUrl(
    createShortUrlDto: CreateShortUrlDto,
  ): Promise<CreateShortUrlResponse> {
    const originalUrl = createShortUrlDto.originalUrl.trim();
    const alias = createShortUrlDto.alias?.trim();
    const shortUrl = alias
      ? await this.createShortUrlWithAlias(originalUrl, alias)
      : await this.createShortUrlWithGeneratedCode(originalUrl);

    await this.urlStatsRepository.createInitialStats(shortUrl.code);

    return {
      code: shortUrl.code,
      originalUrl: shortUrl.originalUrl,
      shortUrl: `${envs.appBaseUrl}/${shortUrl.code}`,
    };
  }

  async resolveShortUrl(
    code: string,
    metadata: ResolveShortUrlMetadata,
  ): Promise<string> {
    const cachedOriginalUrl = await this.urlCacheService.getOriginalUrl(code);

    if (cachedOriginalUrl) {
      await this.publishClickEvent(code, metadata);
      return cachedOriginalUrl;
    }

    const shortUrl = await this.urlsRepository.findByCode(code);

    if (!shortUrl) {
      throw new NotFoundException('Tiny URL not found');
    }

    await this.urlCacheService.setOriginalUrl(code, shortUrl.originalUrl);
    await this.publishClickEvent(code, metadata);

    return shortUrl.originalUrl;
  }

  private async publishClickEvent(
    code: string,
    metadata: ResolveShortUrlMetadata,
  ): Promise<void> {
    const payload = {
      eventId: randomUUID(),
      code,
      clickedAt: new Date().toISOString(),
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    };

    try {
      await this.clickEventsProducer.publishTinyUrlClick(payload);
    } catch (error) {
      this.logger.warn(
        `Failed to publish click event for ${code}: ${this.formatError(error)}`,
      );

      try {
        await this.clickEventsOutboxRepository.createPending(payload);
      } catch (outboxError) {
        this.logger.error(
          `Failed to persist click event outbox for ${code}: ${this.formatError(outboxError)}`,
        );
      }
    }
  }

  private async createShortUrlWithAlias(originalUrl: string, alias: string) {
    try {
      return await this.urlsRepository.create({
        code: alias,
        originalUrl,
        alias,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Tiny URL code or alias already exists');
      }

      throw error;
    }
  }

  private async createShortUrlWithGeneratedCode(originalUrl: string) {
    for (
      let attempt = 0;
      attempt < MAX_SHORT_CODE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const code = this.shortCodeGenerator.generate();
      const codeAlreadyExists = await this.urlsRepository.existsByCode(code);

      if (codeAlreadyExists) {
        this.logger.warn(
          `Short code collision detected before insert for ${code} on attempt ${attempt + 1}/${MAX_SHORT_CODE_GENERATION_ATTEMPTS}`,
        );
        continue;
      }

      try {
        return await this.urlsRepository.create({
          code,
          originalUrl,
        });
      } catch (error) {
        if (this.isDuplicateKeyError(error)) {
          this.logger.warn(
            `Short code collision detected during insert for ${code} on attempt ${attempt + 1}/${MAX_SHORT_CODE_GENERATION_ATTEMPTS}`,
          );
          continue;
        }

        throw error;
      }
    }

    this.logger.error(
      `Failed to generate a unique Tiny URL code after ${MAX_SHORT_CODE_GENERATION_ATTEMPTS} attempts`,
    );

    throw new ConflictException(
      'Could not generate a unique Tiny URL code after multiple attempts',
    );
  }

  private isDuplicateKeyError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    return 'code' in error && error.code === 11000;
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'unknown error';
  }
}
