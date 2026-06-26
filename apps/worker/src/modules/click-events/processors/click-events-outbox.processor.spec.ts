import { ClickEventsOutboxRepository } from '../repositories/click-events-outbox.repository';
import { ClickEventsService } from '../services/click-events.service';
import { ClickEventsOutboxProcessor } from './click-events-outbox.processor';

describe('ClickEventsOutboxProcessor', () => {
  let processor: ClickEventsOutboxProcessor;
  let clickEventsOutboxRepository: jest.Mocked<
    Pick<
      ClickEventsOutboxRepository,
      'claimPending' | 'markProcessed' | 'markFailed'
    >
  >;
  let clickEventsService: jest.Mocked<
    Pick<ClickEventsService, 'registerClick'>
  >;

  beforeEach(() => {
    clickEventsOutboxRepository = {
      claimPending: jest.fn(),
      markProcessed: jest.fn(),
      markFailed: jest.fn(),
    };
    clickEventsService = {
      registerClick: jest.fn(),
    };

    processor = new ClickEventsOutboxProcessor(
      clickEventsOutboxRepository as ClickEventsOutboxRepository,
      clickEventsService as ClickEventsService,
    );
  });

  it('should process pending outbox records and mark them as processed', async () => {
    const clickedAt = new Date('2026-06-11T18:20:15.000Z');

    clickEventsOutboxRepository.claimPending.mockResolvedValue([
      {
        id: '507f1f77bcf86cd799439011',
        eventId: 'event-1',
        code: 'AbC12345',
        clickedAt,
        ip: '127.0.0.1',
        userAgent: 'jest',
        attempts: 1,
      },
    ]);

    await processor.drain();

    expect(clickEventsService.registerClick).toHaveBeenCalledWith({
      eventId: 'event-1',
      code: 'AbC12345',
      clickedAt: clickedAt.toISOString(),
      ip: '127.0.0.1',
      userAgent: 'jest',
    });
    expect(clickEventsOutboxRepository.markProcessed).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
  });

  it('should mark outbox records as failed when processing fails', async () => {
    const error = new Error('mongo failed');

    clickEventsOutboxRepository.claimPending.mockResolvedValue([
      {
        id: '507f1f77bcf86cd799439011',
        eventId: 'event-1',
        code: 'AbC12345',
        clickedAt: new Date('2026-06-11T18:20:15.000Z'),
        attempts: 1,
      },
    ]);
    clickEventsService.registerClick.mockRejectedValue(error);

    await processor.drain();

    expect(clickEventsOutboxRepository.markFailed).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      error,
    );
  });
});
