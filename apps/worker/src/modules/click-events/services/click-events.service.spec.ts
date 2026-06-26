import { ClickEventsRepository } from '../repositories/click-events.repository';
import { UrlStatsRepository } from '../repositories/url-stats.repository';
import { ClickEventsService } from './click-events.service';

describe('ClickEventsService', () => {
  let service: ClickEventsService;
  let clickEventsRepository: jest.Mocked<Pick<ClickEventsRepository, 'create'>>;
  let urlStatsRepository: jest.Mocked<
    Pick<UrlStatsRepository, 'registerClick'>
  >;

  beforeEach(() => {
    clickEventsRepository = {
      create: jest.fn(),
    };
    urlStatsRepository = {
      registerClick: jest.fn(),
    };

    service = new ClickEventsService(
      clickEventsRepository as ClickEventsRepository,
      urlStatsRepository as UrlStatsRepository,
    );
  });

  it('should store click events and update URL stats', async () => {
    clickEventsRepository.create.mockResolvedValue(true);

    await service.registerClick({
      eventId: 'event-1',
      code: 'AbC12345',
      clickedAt: '2026-06-11T18:20:15.000Z',
      ip: '127.0.0.1',
      userAgent: 'jest',
    });

    const clickedAt = new Date('2026-06-11T18:20:15.000Z');

    expect(clickEventsRepository.create).toHaveBeenCalledWith({
      eventId: 'event-1',
      code: 'AbC12345',
      clickedAt,
      ip: '127.0.0.1',
      userAgent: 'jest',
    });
    expect(urlStatsRepository.registerClick).toHaveBeenCalledWith(
      'AbC12345',
      clickedAt,
    );
  });

  it('should skip stats update when event already exists', async () => {
    clickEventsRepository.create.mockResolvedValue(false);

    await service.registerClick({
      eventId: 'event-1',
      code: 'AbC12345',
      clickedAt: '2026-06-11T18:20:15.000Z',
    });

    expect(urlStatsRepository.registerClick).not.toHaveBeenCalled();
  });

  it('should fail when stats update fails after event persistence', async () => {
    clickEventsRepository.create.mockResolvedValue(true);
    urlStatsRepository.registerClick.mockRejectedValue(
      new Error('stats failed'),
    );

    await expect(
      service.registerClick({
        eventId: 'event-1',
        code: 'AbC12345',
        clickedAt: '2026-06-11T18:20:15.000Z',
      }),
    ).rejects.toThrow('stats failed');
  });
});
