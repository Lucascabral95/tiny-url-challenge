import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlsController } from './controllers/urls.controller';
import { UrlStatsRepository } from './repositories/url-stats.repository';
import { UrlsRepository } from './repositories/urls.repository';
import { ShortUrl, ShortUrlSchema } from './schemas/short-url.schema';
import { UrlStats, UrlStatsSchema } from './schemas/url-stats.schema';
import { ShortCodeGeneratorService } from './services/short-code-generator.service';
import { UrlsService } from './services/urls.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShortUrl.name, schema: ShortUrlSchema },
      { name: UrlStats.name, schema: UrlStatsSchema },
    ]),
  ],
  controllers: [UrlsController],
  providers: [
    UrlsService,
    UrlsRepository,
    UrlStatsRepository,
    ShortCodeGeneratorService,
  ],
})
export class UrlsModule {}
