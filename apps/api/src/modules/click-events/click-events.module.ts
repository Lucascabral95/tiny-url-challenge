import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CLICK_EVENTS_QUEUE_NAME } from './click-events.constants';
import { ClickEventsProducer } from './producers/click-events.producer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CLICK_EVENTS_QUEUE_NAME,
    }),
  ],
  providers: [ClickEventsProducer],
  exports: [ClickEventsProducer],
})
export class ClickEventsModule {}
