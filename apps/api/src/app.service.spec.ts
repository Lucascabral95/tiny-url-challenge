import { ServiceUnavailableException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { AppService } from './app.service';

describe('AppService', () => {
  it('should return health status without checking dependencies', () => {
    const service = new AppService({} as Connection);

    expect(service.getHealth()).toEqual({
      status: 'healthy',
      message: 'Health is ok',
    });
  });

  it('should return ready status when MongoDB is connected and responds to ping', async () => {
    const connection = {
      readyState: 1,
      db: {
        admin: jest.fn().mockReturnValue({
          ping: jest.fn().mockResolvedValue({ ok: 1 }),
        }),
      },
    } as unknown as Connection;
    const service = new AppService(connection);

    await expect(service.getReadiness()).resolves.toEqual({
      status: 'ready',
      message: 'API is ready',
      checks: {
        mongodb: 'up',
      },
    });
  });

  it('should throw service unavailable when MongoDB is disconnected', async () => {
    const connection = {
      readyState: 0,
    } as Connection;
    const service = new AppService(connection);

    await expect(service.getReadiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('should throw service unavailable when MongoDB ping fails', async () => {
    const connection = {
      readyState: 1,
      db: {
        admin: jest.fn().mockReturnValue({
          ping: jest.fn().mockRejectedValue(new Error('ping failed')),
        }),
      },
    } as unknown as Connection;
    const service = new AppService(connection);

    await expect(service.getReadiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
