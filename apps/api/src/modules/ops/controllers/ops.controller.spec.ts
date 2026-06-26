import { Test, TestingModule } from '@nestjs/testing';
import { OpsService } from '../services/ops.service';
import { OpsController } from './ops.controller';

describe('OpsController', () => {
  let controller: OpsController;
  let opsService: jest.Mocked<Pick<OpsService, 'getStatus'>>;

  beforeEach(async () => {
    opsService = {
      getStatus: jest.fn().mockResolvedValue({
        generatedAt: '2026-06-26T18:00:00.000Z',
        outbox: {
          pending: 0,
          processing: 0,
          failed: 0,
          dead: 0,
          processed: 0,
        },
        queue: {
          waiting: 0,
          active: 0,
          delayed: 0,
          failed: 0,
          completed: 0,
          paused: 0,
        },
        cache: {
          state: 'available',
          circuitOpen: false,
          unavailableUntil: null,
          ttlSeconds: 86400,
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpsController],
      providers: [
        {
          provide: OpsService,
          useValue: opsService,
        },
      ],
    }).compile();

    controller = module.get<OpsController>(OpsController);
  });

  it('should delegate operational status to the service', async () => {
    await expect(controller.getStatus()).resolves.toEqual(
      expect.objectContaining({
        generatedAt: '2026-06-26T18:00:00.000Z',
      }),
    );
    expect(opsService.getStatus).toHaveBeenCalled();
  });
});
