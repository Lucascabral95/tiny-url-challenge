import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  CLICK_EVENTS_QUEUE_NAME,
  ClickEventPayload,
} from '../click-events.constants';
import { ClickEventsService } from '../services/click-events.service';

@Injectable()
@Processor(CLICK_EVENTS_QUEUE_NAME)
export class ClickEventsProcessor extends WorkerHost {
  constructor(private readonly clickEventsService: ClickEventsService) {
    super();
  }

  async process(job: Job<ClickEventPayload>): Promise<void> {
    await this.clickEventsService.registerClick(job.data);
  }
}
