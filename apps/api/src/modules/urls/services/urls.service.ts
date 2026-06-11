import { ConflictException, Injectable } from '@nestjs/common';
import { envs } from '../../../config/env.schema';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { UrlStatsRepository } from '../repositories/url-stats.repository';
import { UrlsRepository } from '../repositories/urls.repository';
import { ShortCodeGeneratorService } from './short-code-generator.service';

export interface CreateShortUrlResponse {
  code: string;
  originalUrl: string;
  shortUrl: string;
}

@Injectable()
export class UrlsService {
  constructor(
    private readonly urlsRepository: UrlsRepository,
    private readonly urlStatsRepository: UrlStatsRepository,
    private readonly shortCodeGenerator: ShortCodeGeneratorService,
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

  private isDuplicateKeyError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    return 'code' in error && error.code === 11000;
  }
}
