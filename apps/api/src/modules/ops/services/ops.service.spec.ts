import { ClickEventsOutboxRepository } from '../../click-events/repositories/click-events-outbox.repository';
import { ClickEventsQueueMetricsService } from '../../click-events/services/click-events-queue-metrics.service';
import { UrlCacheService } from '../../urls/services/url-cache.service';
import { OpsService } from './ops.service';

describe('OpsService', () => {
  let service: OpsService;
  let outboxRepository: jest.Mocked<
    Pick<ClickEventsOutboxRepository, 'countByStatus'>
  >;
  let queueMetricsService: jest.Mocked<
    Pick<ClickEventsQueueMetricsService, 'getJobCounts'>
  >;
  let urlCacheService: jest.Mocked<Pick<UrlCacheService, 'getStatus'>>;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-26T18:00:00.000Z'));

    outboxRepository = {
      countByStatus: jest.fn().mockResolvedValue({
        pending: 1,
        processing: 0,
        failed: 2,
        dead: 3,
        processed: 4,
      }),
    };
    queueMetricsService = {
      getJobCounts: jest.fn().mockResolvedValue({
        waiting: 0,
        active: 1,
        delayed: 0,
        failed: 2,
        completed: 10,
        paused: 0,
      }),
    };
    urlCacheService = {
      getStatus: jest.fn().mockReturnValue({
        state: 'available',
        circuitOpen: false,
        unavailableUntil: null,
        ttlSeconds: 86400,
      }),
    };

    service = new OpsService(
      outboxRepository as ClickEventsOutboxRepository,
      queueMetricsService as ClickEventsQueueMetricsService,
      urlCacheService as UrlCacheService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return operational status for outbox, queue and cache', async () => {
    await expect(service.getStatus()).resolves.toEqual({
      generatedAt: '2026-06-26T18:00:00.000Z',
      outbox: {
        pending: 1,
        processing: 0,
        failed: 2,
        dead: 3,
        processed: 4,
      },
      queue: {
        waiting: 0,
        active: 1,
        delayed: 0,
        failed: 2,
        completed: 10,
        paused: 0,
      },
      cache: {
        state: 'available',
        circuitOpen: false,
        unavailableUntil: null,
        ttlSeconds: 86400,
      },
    });
  });
});
