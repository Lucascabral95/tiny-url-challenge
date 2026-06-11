import { Job } from 'bullmq';
import { ClickEventPayload } from '../click-events.constants';
import { ClickEventsRepository } from '../repositories/click-events.repository';
import { UrlStatsRepository } from '../repositories/url-stats.repository';
import { ClickEventsProcessor } from './click-events.processor';

describe('ClickEventsProcessor', () => {
  let processor: ClickEventsProcessor;
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
    processor = new ClickEventsProcessor(
      clickEventsRepository as ClickEventsRepository,
      urlStatsRepository as UrlStatsRepository,
    );
  });

  it('should store click events and update URL stats', async () => {
    const job = {
      data: {
        code: 'AbC12345',
        clickedAt: '2026-06-11T18:20:15.000Z',
        ip: '127.0.0.1',
        userAgent: 'jest',
      },
    } as Job<ClickEventPayload>;

    await processor.process(job);

    const clickedAt = new Date('2026-06-11T18:20:15.000Z');

    expect(clickEventsRepository.create).toHaveBeenCalledWith({
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

  it('should fail the job when event persistence fails', async () => {
    const job = {
      data: {
        code: 'AbC12345',
        clickedAt: '2026-06-11T18:20:15.000Z',
      },
    } as Job<ClickEventPayload>;

    clickEventsRepository.create.mockRejectedValue(new Error('mongo failed'));

    await expect(processor.process(job)).rejects.toThrow('mongo failed');
    expect(urlStatsRepository.registerClick).not.toHaveBeenCalled();
  });

  it('should fail the job when stats update fails', async () => {
    const job = {
      data: {
        code: 'AbC12345',
        clickedAt: '2026-06-11T18:20:15.000Z',
      },
    } as Job<ClickEventPayload>;

    urlStatsRepository.registerClick.mockRejectedValue(
      new Error('stats failed'),
    );

    await expect(processor.process(job)).rejects.toThrow('stats failed');
  });
});
