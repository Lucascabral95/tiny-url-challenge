import { Body, Controller, Post } from '@nestjs/common';
import { CreateShortUrlDto } from '../dto/create-short-url.dto';
import { CreateShortUrlResponse, UrlsService } from '../services/urls.service';

@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post()
  create(
    @Body() createShortUrlDto: CreateShortUrlDto,
  ): Promise<CreateShortUrlResponse> {
    return this.urlsService.createShortUrl(createShortUrlDto);
  }
}
