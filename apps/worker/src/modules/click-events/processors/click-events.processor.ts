import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  CLICK_EVENTS_QUEUE_NAME,
  ClickEventPayload,
} from '../click-events.constants';
import { ClickEventsRepository } from '../repositories/click-events.repository';
import { UrlStatsRepository } from '../repositories/url-stats.repository';

@Injectable()
@Processor(CLICK_EVENTS_QUEUE_NAME)
export class ClickEventsProcessor extends WorkerHost {
  constructor(
    private readonly clickEventsRepository: ClickEventsRepository,
    private readonly urlStatsRepository: UrlStatsRepository,
  ) {
    super();
  }

  async process(job: Job<ClickEventPayload>): Promise<void> {
    const clickedAt = new Date(job.data.clickedAt);

    await this.clickEventsRepository.create({
      code: job.data.code,
      clickedAt,
      ip: job.data.ip,
      userAgent: job.data.userAgent,
    });

    await this.urlStatsRepository.registerClick(job.data.code, clickedAt);
  }
}
