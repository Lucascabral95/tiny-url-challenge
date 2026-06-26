import { Job } from 'bullmq';
import { ClickEventPayload } from '../click-events.constants';
import { ClickEventsService } from '../services/click-events.service';
import { ClickEventsProcessor } from './click-events.processor';

describe('ClickEventsProcessor', () => {
  let processor: ClickEventsProcessor;
  let clickEventsService: jest.Mocked<
    Pick<ClickEventsService, 'registerClick'>
  >;

  beforeEach(() => {
    clickEventsService = {
      registerClick: jest.fn(),
    };
    processor = new ClickEventsProcessor(
      clickEventsService as ClickEventsService,
    );
  });

  it('should register click events from BullMQ jobs', async () => {
    const job = {
      data: {
        eventId: 'event-1',
        code: 'AbC12345',
        clickedAt: '2026-06-11T18:20:15.000Z',
        ip: '127.0.0.1',
        userAgent: 'jest',
      },
    } as Job<ClickEventPayload>;

    await processor.process(job);

    expect(clickEventsService.registerClick).toHaveBeenCalledWith({
      eventId: 'event-1',
      code: 'AbC12345',
      clickedAt: '2026-06-11T18:20:15.000Z',
      ip: '127.0.0.1',
      userAgent: 'jest',
    });
  });

  it('should fail the job when registration fails', async () => {
    const job = {
      data: {
        eventId: 'event-1',
        code: 'AbC12345',
        clickedAt: '2026-06-11T18:20:15.000Z',
      },
    } as Job<ClickEventPayload>;

    clickEventsService.registerClick.mockRejectedValue(
      new Error('mongo failed'),
    );

    await expect(processor.process(job)).rejects.toThrow('mongo failed');
  });
});
