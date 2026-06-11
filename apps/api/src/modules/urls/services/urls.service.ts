import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { envs } from '../../../config/env.schema';
import { ClickEventsProducer } from '../../click-events/producers/click-events.producer';
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
  ) {}

  async createShortUrl(
    createShortUrlDto: CreateShortUrlDto,
  ): Promise<CreateShortUrlResponse> {
    const originalUrl = createShortUrlDto.originalUrl.trim();
    const alias = createShortUrlDto.alias?.trim();
    const code = alias ?? this.shortCodeGenerator.generate();

    try {
      const shortUrl = await this.urlsRepository.create({
        code,
        originalUrl,
        alias,
      });

      await this.urlStatsRepository.createInitialStats(shortUrl.code);

      return {
        code: shortUrl.code,
        originalUrl: shortUrl.originalUrl,
        shortUrl: `${envs.appBaseUrl}/${shortUrl.code}`,
      };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Tiny URL code or alias already exists');
      }

      throw error;
    }
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
    try {
      await this.clickEventsProducer.publishTinyUrlClick({
        code,
        clickedAt: new Date().toISOString(),
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to publish click event for ${code}: ${this.formatError(error)}`,
      );
    }
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
