import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from '../services/stats.service';
import { StatsController } from './stats.controller';

describe('StatsController', () => {
  let statsController: StatsController;
  let statsService: jest.Mocked<Pick<StatsService, 'getStats'>>;

  beforeEach(async () => {
    statsService = {
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: statsService,
        },
      ],
    }).compile();

    statsController = module.get<StatsController>(StatsController);
  });

  it('should delegate stats lookup to the service', async () => {
    const response = {
      code: 'nodejs-test',
      totalClicks: 3,
      lastClick: new Date('2026-06-11T23:34:04.308Z'),
    };

    statsService.getStats.mockResolvedValue(response);

    await expect(statsController.getStats('nodejs-test')).resolves.toEqual(
      response,
    );
    expect(statsService.getStats).toHaveBeenCalledWith('nodejs-test');
  });
});
