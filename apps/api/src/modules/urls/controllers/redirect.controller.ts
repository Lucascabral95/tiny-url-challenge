import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { UrlsService } from '../services/urls.service';

@Controller()
export class RedirectController {
  constructor(private readonly urlsService: UrlsService) {}

  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const originalUrl = await this.urlsService.resolveShortUrl(code, {
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    response.redirect(HttpStatus.FOUND, originalUrl);
  }
}
