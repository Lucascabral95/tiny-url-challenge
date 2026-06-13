import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common';
import {
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { UrlsService } from '../services/urls.service';

@ApiTags('redirects')
@Controller()
export class RedirectController {
  constructor(private readonly urlsService: UrlsService) {}

  @ApiOperation({
    summary: 'Resolver una Tiny URL y redireccionar a la URL original',
  })
  @ApiParam({
    name: 'code',
    example: 'mi-alias',
    description: 'Codigo corto o alias de la Tiny URL.',
  })
  @ApiFoundResponse({
    description: 'Redireccion 302 hacia la URL original.',
    headers: {
      Location: {
        description: 'URL original de destino.',
        schema: { type: 'string', example: 'https://www.google.com' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No existe una Tiny URL para el codigo enviado.',
    type: ErrorResponseDto,
  })
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
