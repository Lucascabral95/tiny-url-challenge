import { Test, TestingModule } from '@nestjs/testing';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { UrlsService } from '../services/urls.service';
import { UrlsController } from './urls.controller';

describe('UrlsController', () => {
  let urlsController: UrlsController;
  let urlsService: jest.Mocked<Pick<UrlsService, 'createShortUrl'>>;

  beforeEach(async () => {
    urlsService = {
      createShortUrl: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: urlsService,
        },
      ],
    }).compile();

    urlsController = app.get<UrlsController>(UrlsController);
  });

  it('should delegate Tiny URL creation to the service', async () => {
    const createShortUrlDto: CreateShortUrlDto = {
      originalUrl: 'https://www.google.com/search?q=nodejs',
      alias: 'mi-alias',
    };
    const response = {
      code: 'mi-alias',
      originalUrl: createShortUrlDto.originalUrl,
      shortUrl: 'http://localhost:3000/mi-alias',
    };

    urlsService.createShortUrl.mockResolvedValue(response);

    await expect(urlsController.create(createShortUrlDto)).resolves.toEqual(
      response,
    );
    expect(urlsService.createShortUrl).toHaveBeenCalledWith(createShortUrlDto);
  });
});
