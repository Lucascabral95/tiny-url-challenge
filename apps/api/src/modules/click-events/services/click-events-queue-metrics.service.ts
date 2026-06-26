import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  CLICK_EVENTS_QUEUE_NAME,
  ClickEventPayload,
} from '../click-events.constants';

export interface ClickEventsQueueCounts {
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  paused: number;
}

@Injectable()
export class ClickEventsQueueMetricsService {
  constructor(
    @InjectQueue(CLICK_EVENTS_QUEUE_NAME)
    private readonly clickEventsQueue: Queue<ClickEventPayload>,
  ) {}

  async getJobCounts(): Promise<ClickEventsQueueCounts> {
    const counts = await this.clickEventsQueue.getJobCounts(
      'waiting',
      'active',
      'delayed',
      'failed',
      'completed',
      'paused',
    );

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      delayed: counts.delayed ?? 0,
      failed: counts.failed ?? 0,
      completed: counts.completed ?? 0,
      paused: counts.paused ?? 0,
    };
  }
}
