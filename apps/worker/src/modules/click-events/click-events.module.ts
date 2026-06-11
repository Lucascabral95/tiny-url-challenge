import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CLICK_EVENTS_QUEUE_NAME } from './click-events.constants';
import { ClickEventsProcessor } from './processors/click-events.processor';
import { MongooseModule } from '@nestjs/mongoose';
import { ClickEventsRepository } from './repositories/click-events.repository';
import { UrlStatsRepository } from './repositories/url-stats.repository';
import { ClickEvent, ClickEventSchema } from './schemas/click-event.schema';
import { UrlStats, UrlStatsSchema } from './schemas/url-stats.schema';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CLICK_EVENTS_QUEUE_NAME,
    }),
    MongooseModule.forFeature([
      { name: ClickEvent.name, schema: ClickEventSchema },
      { name: UrlStats.name, schema: UrlStatsSchema },
    ]),
  ],
  providers: [ClickEventsRepository, UrlStatsRepository, ClickEventsProcessor],
  exports: [ClickEventsRepository],
})
export class ClickEventsModule {}
