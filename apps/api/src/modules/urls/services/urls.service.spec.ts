import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { UrlStatsRepository } from '../repositories/url-stats.repository';
import { UrlsRepository } from '../repositories/urls.repository';
import { ShortCodeGeneratorService } from './short-code-generator.service';
import { UrlsService } from './urls.service';

describe('UrlsService', () => {
  let urlsService: UrlsService;
  let urlsRepository: jest.Mocked<Pick<UrlsRepository, 'create'>>;
  let urlStatsRepository: jest.Mocked<
    Pick<UrlStatsRepository, 'createInitialStats'>
  >;
  let shortCodeGenerator: jest.Mocked<
    Pick<ShortCodeGeneratorService, 'generate'>
  >;

  beforeEach(async () => {
    urlsRepository = {
      create: jest.fn(),
    };
    urlStatsRepository = {
      createInitialStats: jest.fn(),
    };
    shortCodeGenerator = {
      generate: jest.fn(),
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
});
