import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { CLICK_EVENTS_QUEUE_NAME } from './click-events.constants';
import { ClickEventsProducer } from './producers/click-events.producer';
import { ClickEventsOutboxRepository } from './repositories/click-events-outbox.repository';
import { ClickEventsQueueMetricsService } from './services/click-events-queue-metrics.service';
import {
  ClickEventOutbox,
  ClickEventOutboxSchema,
} from './schemas/click-event-outbox.schema';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CLICK_EVENTS_QUEUE_NAME,
    }),
    MongooseModule.forFeature([
      { name: ClickEventOutbox.name, schema: ClickEventOutboxSchema },
    ]),
  ],
  providers: [
    ClickEventsProducer,
    ClickEventsOutboxRepository,
    ClickEventsQueueMetricsService,
  ],
  exports: [
    ClickEventsProducer,
    ClickEventsOutboxRepository,
    ClickEventsQueueMetricsService,
  ],
})
export class ClickEventsModule {}
