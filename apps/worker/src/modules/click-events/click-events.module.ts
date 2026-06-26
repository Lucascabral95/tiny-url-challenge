import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CLICK_EVENTS_QUEUE_NAME } from './click-events.constants';
import { ClickEventsProcessor } from './processors/click-events.processor';
import { MongooseModule } from '@nestjs/mongoose';
import { ClickEventsRepository } from './repositories/click-events.repository';
import { ClickEventsOutboxRepository } from './repositories/click-events-outbox.repository';
import { UrlStatsRepository } from './repositories/url-stats.repository';
import { ClickEvent, ClickEventSchema } from './schemas/click-event.schema';
import {
  ClickEventOutbox,
  ClickEventOutboxSchema,
} from './schemas/click-event-outbox.schema';
import { UrlStats, UrlStatsSchema } from './schemas/url-stats.schema';
import { ClickEventsService } from './services/click-events.service';
import { ClickEventsOutboxProcessor } from './processors/click-events-outbox.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CLICK_EVENTS_QUEUE_NAME,
    }),
    MongooseModule.forFeature([
      { name: ClickEvent.name, schema: ClickEventSchema },
      { name: ClickEventOutbox.name, schema: ClickEventOutboxSchema },
      { name: UrlStats.name, schema: UrlStatsSchema },
    ]),
  ],
  providers: [
    ClickEventsRepository,
    ClickEventsOutboxRepository,
    UrlStatsRepository,
    ClickEventsService,
    ClickEventsProcessor,
    ClickEventsOutboxProcessor,
  ],
  exports: [ClickEventsRepository],
})
export class ClickEventsModule {}
