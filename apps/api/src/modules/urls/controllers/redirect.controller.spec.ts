import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { UrlsService } from '../services/urls.service';
import { RedirectController } from './redirect.controller';

describe('RedirectController', () => {
  let redirectController: RedirectController;
  let urlsService: jest.Mocked<Pick<UrlsService, 'resolveShortUrl'>>;

  beforeEach(async () => {
    urlsService = {
      resolveShortUrl: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [RedirectController],
      providers: [
        {
          provide: UrlsService,
          useValue: urlsService,
        },
      ],
    }).compile();

    redirectController = app.get<RedirectController>(RedirectController);
  });

  it('should resolve a code and redirect with 302', async () => {
    const redirect = jest.fn();
    const request = {
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('jest'),
    } as unknown as Request;
    const response = {
      redirect,
    } as unknown as Response;

    urlsService.resolveShortUrl.mockResolvedValue(
      'https://www.google.com/search?q=nodejs',
    );

    await redirectController.redirect('AbC12345', request, response);

    expect(urlsService.resolveShortUrl).toHaveBeenCalledWith('AbC12345', {
      ip: '127.0.0.1',
      userAgent: 'jest',
    });
    expect(redirect).toHaveBeenCalledWith(
      HttpStatus.FOUND,
      'https://www.google.com/search?q=nodejs',
    );
  });
});
