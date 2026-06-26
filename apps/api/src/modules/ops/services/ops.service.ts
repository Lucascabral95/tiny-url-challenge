import { Injectable } from '@nestjs/common';
import {
  ClickEventsOutboxRepository,
  ClickEventOutboxStatusCounts,
} from '../../click-events/repositories/click-events-outbox.repository';
import {
  ClickEventsQueueCounts,
  ClickEventsQueueMetricsService,
} from '../../click-events/services/click-events-queue-metrics.service';
import {
  UrlCacheService,
  UrlCacheStatus,
} from '../../urls/services/url-cache.service';
import { OpsStatusResponseDto } from '../dto/ops-status-response.dto';

@Injectable()
export class OpsService {
  constructor(
    private readonly clickEventsOutboxRepository: ClickEventsOutboxRepository,
    private readonly clickEventsQueueMetricsService: ClickEventsQueueMetricsService,
    private readonly urlCacheService: UrlCacheService,
  ) {}

  async getStatus(): Promise<OpsStatusResponseDto> {
    const [outbox, queue]: [
      ClickEventOutboxStatusCounts,
      ClickEventsQueueCounts,
    ] = await Promise.all([
      this.clickEventsOutboxRepository.countByStatus(),
      this.clickEventsQueueMetricsService.getJobCounts(),
    ]);
    const cache: UrlCacheStatus = this.urlCacheService.getStatus();

    return {
      generatedAt: new Date().toISOString(),
      outbox,
      queue,
      cache,
    };
  }
}
