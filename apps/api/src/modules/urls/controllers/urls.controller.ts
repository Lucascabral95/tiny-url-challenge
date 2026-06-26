import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { RateLimit } from '../../../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../../../common/rate-limit/rate-limit.guard';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { CreateShortUrlResponseDto } from '../dto/create-short-url-response.dto';
import { CREATE_URL_RATE_LIMIT } from '../rate-limit.constants';
import { CreateShortUrlResponse, UrlsService } from '../services/urls.service';

@ApiTags('urls')
@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @ApiOperation({ summary: 'Crear una Tiny URL' })
  @ApiBody({ type: CreateShortUrlDto })
  @ApiCreatedResponse({
    description: 'Tiny URL creada correctamente.',
    type: CreateShortUrlResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'El body enviado no cumple las validaciones.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'El codigo o alias ya existe.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Se excedio el limite de creacion de Tiny URLs.',
    type: ErrorResponseDto,
  })
  @UseGuards(RateLimitGuard)
  @RateLimit(CREATE_URL_RATE_LIMIT)
  @Post()
  create(
    @Body() createShortUrlDto: CreateShortUrlDto,
  ): Promise<CreateShortUrlResponse> {
    return this.urlsService.createShortUrl(createShortUrlDto);
  }
}
