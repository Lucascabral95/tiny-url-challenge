import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClickEventsProducer } from '../../click-events/producers/click-events.producer';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { UrlStatsRepository } from '../repositories/url-stats.repository';
import { UrlsRepository } from '../repositories/urls.repository';
import { ShortCodeGeneratorService } from './short-code-generator.service';
import { UrlCacheService } from './url-cache.service';
import { UrlsService } from './urls.service';

describe('UrlsService', () => {
  let urlsService: UrlsService;
  let urlsRepository: jest.Mocked<
    Pick<UrlsRepository, 'create' | 'findByCode'>
  >;
  let urlStatsRepository: jest.Mocked<
    Pick<UrlStatsRepository, 'createInitialStats'>
  >;
  let shortCodeGenerator: jest.Mocked<
    Pick<ShortCodeGeneratorService, 'generate'>
  >;
  let urlCacheService: jest.Mocked<
    Pick<UrlCacheService, 'getOriginalUrl' | 'setOriginalUrl'>
  >;
  let clickEventsProducer: jest.Mocked<
    Pick<ClickEventsProducer, 'publishTinyUrlClick'>
  >;

  beforeEach(async () => {
    urlsRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
    };
    urlStatsRepository = {
      createInitialStats: jest.fn(),
    };
    shortCodeGenerator = {
      generate: jest.fn(),
    };
    urlCacheService = {
      getOriginalUrl: jest.fn(),
      setOriginalUrl: jest.fn(),
    };
    clickEventsProducer = {
      publishTinyUrlClick: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: UrlsRepository,
          useValue: urlsRepository,
        },
        {
          provide: UrlStatsRepository,
          useValue: urlStatsRepository,
        },
        {
          provide: ShortCodeGeneratorService,
          useValue: shortCodeGenerator,
        },
        {
          provide: UrlCacheService,
          useValue: urlCacheService,
        },
        {
          provide: ClickEventsProducer,
          useValue: clickEventsProducer,
        },
      ],
    }).compile();

    urlsService = module.get<UrlsService>(UrlsService);
  });

  it('should create a Tiny URL with a custom alias', async () => {
    const createShortUrlDto: CreateShortUrlDto = {
      originalUrl: 'https://www.google.com/search?q=nodejs',
      alias: 'mi-alias',
    };

    urlsRepository.create.mockResolvedValue({
      code: 'mi-alias',
      originalUrl: createShortUrlDto.originalUrl,
      alias: 'mi-alias',
    });

    await expect(
      urlsService.createShortUrl(createShortUrlDto),
    ).resolves.toEqual({
      code: 'mi-alias',
      originalUrl: createShortUrlDto.originalUrl,
      shortUrl: 'http://localhost:3000/mi-alias',
    });
    expect(urlsRepository.create).toHaveBeenCalledWith({
      code: 'mi-alias',
      originalUrl: createShortUrlDto.originalUrl,
      alias: 'mi-alias',
    });
    expect(urlStatsRepository.createInitialStats).toHaveBeenCalledWith(
      'mi-alias',
    );
  });

  it('should create a Tiny URL with a generated code', async () => {
    const createShortUrlDto: CreateShortUrlDto = {
      originalUrl: 'https://www.google.com/search?q=nodejs',
    };

    shortCodeGenerator.generate.mockReturnValue('AbC12345');
    urlsRepository.create.mockResolvedValue({
      code: 'AbC12345',
      originalUrl: createShortUrlDto.originalUrl,
    });

    await expect(
      urlsService.createShortUrl(createShortUrlDto),
    ).resolves.toEqual({
      code: 'AbC12345',
      originalUrl: createShortUrlDto.originalUrl,
      shortUrl: 'http://localhost:3000/AbC12345',
    });
    expect(urlsRepository.create).toHaveBeenCalledWith({
      code: 'AbC12345',
      originalUrl: createShortUrlDto.originalUrl,
      alias: undefined,
    });
    expect(urlStatsRepository.createInitialStats).toHaveBeenCalledWith(
      'AbC12345',
    );
  });

  it('should reject duplicated aliases', async () => {
    const createShortUrlDto: CreateShortUrlDto = {
      originalUrl: 'https://www.google.com/search?q=nodejs',
      alias: 'mi-alias',
    };

    urlsRepository.create.mockRejectedValue({ code: 11000 });

    await expect(
      urlsService.createShortUrl(createShortUrlDto),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(urlStatsRepository.createInitialStats).not.toHaveBeenCalled();
  });

  it('should resolve a Tiny URL from Redis cache', async () => {
    urlCacheService.getOriginalUrl.mockResolvedValue(
      'https://www.google.com/search?q=nodejs',
    );

    await expect(
      urlsService.resolveShortUrl('AbC12345', {
        ip: '127.0.0.1',
        userAgent: 'jest',
      }),
    ).resolves.toBe('https://www.google.com/search?q=nodejs');

    expect(urlsRepository.findByCode).not.toHaveBeenCalled();
    expect(urlCacheService.setOriginalUrl).not.toHaveBeenCalled();
    expect(clickEventsProducer.publishTinyUrlClick).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'AbC12345',
        ip: '127.0.0.1',
        userAgent: 'jest',
      }),
    );
  });

  it('should resolve a Tiny URL from MongoDB and repopulate Redis', async () => {
    urlCacheService.getOriginalUrl.mockResolvedValue(null);
    urlsRepository.findByCode.mockResolvedValue({
      code: 'AbC12345',
      originalUrl: 'https://www.google.com/search?q=nodejs',
    });

    await expect(
      urlsService.resolveShortUrl('AbC12345', {
        ip: '127.0.0.1',
        userAgent: 'jest',
      }),
    ).resolves.toBe('https://www.google.com/search?q=nodejs');

    expect(urlsRepository.findByCode).toHaveBeenCalledWith('AbC12345');
    expect(urlCacheService.setOriginalUrl).toHaveBeenCalledWith(
      'AbC12345',
      'https://www.google.com/search?q=nodejs',
    );
    expect(clickEventsProducer.publishTinyUrlClick).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'AbC12345',
        ip: '127.0.0.1',
        userAgent: 'jest',
      }),
    );
  });

  it('should reject unknown Tiny URL codes', async () => {
    urlCacheService.getOriginalUrl.mockResolvedValue(null);
    urlsRepository.findByCode.mockResolvedValue(null);

    await expect(
      urlsService.resolveShortUrl('missing', {}),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(urlCacheService.setOriginalUrl).not.toHaveBeenCalled();
    expect(clickEventsProducer.publishTinyUrlClick).not.toHaveBeenCalled();
  });

  it('should not fail resolution when click event publishing fails', async () => {
    urlCacheService.getOriginalUrl.mockResolvedValue(
      'https://www.google.com/search?q=nodejs',
    );
    clickEventsProducer.publishTinyUrlClick.mockRejectedValue(
      new Error('queue unavailable'),
    );

    await expect(urlsService.resolveShortUrl('AbC12345', {})).resolves.toBe(
      'https://www.google.com/search?q=nodejs',
    );
  });
});
