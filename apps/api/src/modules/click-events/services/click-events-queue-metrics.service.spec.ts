import { Queue } from 'bullmq';
import { ClickEventPayload } from '../click-events.constants';
import { ClickEventsQueueMetricsService } from './click-events-queue-metrics.service';

describe('ClickEventsQueueMetricsService', () => {
  it('should return normalized BullMQ job counts', async () => {
    const queue = {
      getJobCounts: jest.fn().mockResolvedValue({
        waiting: 1,
        active: 2,
        delayed: 3,
        failed: 4,
        completed: 5,
        paused: 6,
      }),
    } as unknown as Queue<ClickEventPayload>;
    const service = new ClickEventsQueueMetricsService(queue);

    await expect(service.getJobCounts()).resolves.toEqual({
      waiting: 1,
      active: 2,
      delayed: 3,
      failed: 4,
      completed: 5,
      paused: 6,
    });
  });
});
