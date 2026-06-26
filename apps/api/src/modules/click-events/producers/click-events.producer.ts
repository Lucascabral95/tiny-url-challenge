import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  CLICK_EVENT_PUBLISH_TIMEOUT_MS,
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
    await this.withTimeout(
      this.clickEventsQueue.add(TINY_URL_CLICKED_JOB_NAME, payload, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
      }),
      CLICK_EVENT_PUBLISH_TIMEOUT_MS,
    );
  }

  private async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`Click event publish timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([operation, timeoutPromise]);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }
}
