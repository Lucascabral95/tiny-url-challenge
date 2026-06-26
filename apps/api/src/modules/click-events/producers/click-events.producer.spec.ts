import { Queue } from 'bullmq';
import {
  CLICK_EVENT_PUBLISH_TIMEOUT_MS,
  ClickEventPayload,
  TINY_URL_CLICKED_JOB_NAME,
} from '../click-events.constants';
import { ClickEventsProducer } from './click-events.producer';

describe('ClickEventsProducer', () => {
  let queue: jest.Mocked<Pick<Queue<ClickEventPayload>, 'add'>>;
  let producer: ClickEventsProducer;

  beforeEach(() => {
    queue = {
      add: jest.fn(),
    };

    producer = new ClickEventsProducer(
      queue as unknown as Queue<ClickEventPayload>,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should publish a click event job', async () => {
    const payload = {
      eventId: 'event-1',
      code: 'AbC12345',
      clickedAt: '2026-06-26T12:00:00.000Z',
      ip: '127.0.0.1',
      userAgent: 'jest',
    };

    queue.add.mockResolvedValue({} as never);

    await producer.publishTinyUrlClick(payload);

    expect(queue.add).toHaveBeenCalledWith(TINY_URL_CLICKED_JOB_NAME, payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    });
  });

  it('should fail fast when BullMQ publish does not resolve', async () => {
    jest.useFakeTimers();

    queue.add.mockReturnValue(new Promise(() => undefined) as never);

    const publishPromise = producer.publishTinyUrlClick({
      eventId: 'event-1',
      code: 'AbC12345',
      clickedAt: '2026-06-26T12:00:00.000Z',
    });

    jest.advanceTimersByTime(CLICK_EVENT_PUBLISH_TIMEOUT_MS);

    await expect(publishPromise).rejects.toThrow(
      'Click event publish timed out',
    );
  });
});
