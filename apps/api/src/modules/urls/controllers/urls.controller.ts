import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { CreateShortUrlResponseDto } from '../dto/create-short-url-response.dto';
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
  @Post()
  create(
    @Body() createShortUrlDto: CreateShortUrlDto,
  ): Promise<CreateShortUrlResponse> {
    return this.urlsService.createShortUrl(createShortUrlDto);
  }
}
