import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StatsRepository } from '../repositories/stats.repository';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let statsService: StatsService;
  let statsRepository: jest.Mocked<Pick<StatsRepository, 'findByCode'>>;

  beforeEach(async () => {
    statsRepository = {
      findByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: StatsRepository,
          useValue: statsRepository,
        },
      ],
    }).compile();

    statsService = module.get<StatsService>(StatsService);
  });

  it('should return stats when they exist', async () => {
    const lastClick = new Date('2026-06-11T23:34:04.308Z');

    statsRepository.findByCode.mockResolvedValue({
      code: 'nodejs-test',
      totalClicks: 3,
      lastClick,
    });

    await expect(statsService.getStats('nodejs-test')).resolves.toEqual({
      code: 'nodejs-test',
      totalClicks: 3,
      lastClick,
    });
  });

  it('should return stats with null lastClick when there are no clicks', async () => {
    statsRepository.findByCode.mockResolvedValue({
      code: 'nodejs-test',
      totalClicks: 0,
      lastClick: null,
    });

    await expect(statsService.getStats('nodejs-test')).resolves.toEqual({
      code: 'nodejs-test',
      totalClicks: 0,
      lastClick: null,
    });
  });

  it('should reject unknown stats', async () => {
    statsRepository.findByCode.mockResolvedValue(null);

    await expect(statsService.getStats('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
