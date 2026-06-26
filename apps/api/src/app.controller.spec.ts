import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: jest.Mocked<Pick<AppService, 'getHealth' | 'getReadiness'>>;

  beforeEach(async () => {
    appService = {
      getHealth: jest.fn(),
      getReadiness: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return the health status', () => {
      appService.getHealth.mockReturnValue({
        status: 'healthy',
        message: 'Health is ok',
      });

      expect(appController.getHealth()).toEqual({
        status: 'healthy',
        message: 'Health is ok',
      });
    });
  });

  describe('ready', () => {
    it('should return the readiness status', async () => {
      appService.getReadiness.mockResolvedValue({
        status: 'ready',
        message: 'API is ready',
        checks: {
          mongodb: 'up',
        },
      });

      await expect(appController.getReadiness()).resolves.toEqual({
        status: 'ready',
        message: 'API is ready',
        checks: {
          mongodb: 'up',
        },
      });
    });
  });
});
