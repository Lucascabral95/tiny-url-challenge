import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './controllers/stats.controller';
import { StatsRepository } from './repositories/stats.repository';
import { StatsService } from './services/stats.service';
import { UrlStats, UrlStatsSchema } from '../urls/schemas/url-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UrlStats.name, schema: UrlStatsSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService, StatsRepository],
})
export class StatsModule {}
