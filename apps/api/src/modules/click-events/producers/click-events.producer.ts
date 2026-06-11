import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  CLICK_EVENTS_QUEUE_NAME,
  ClickEventPayload,
  TINY_URL_CLICKED_JOB_NAME,
} from '../click-events.constants';

@Injectable()
export class ClickEventsProducer {
  constructor(
    @InjectQueue(CLICK_EVENTS_QUEUE_NAME)
    private readonly clickEventsQueue: Queue<ClickEventPayload>,
  ) {}

  async publishTinyUrlClick(payload: ClickEventPayload): Promise<void> {
    await this.clickEventsQueue.add(TINY_URL_CLICKED_JOB_NAME, payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    });
  }
}
