import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
import { HealthResponseDto, ReadinessResponseDto } from './app.dto';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getHealth(): HealthResponseDto {
    return {
      status: 'healthy',
      message: 'Health is ok',
    };
  }

  async getReadiness(): Promise<ReadinessResponseDto> {
    try {
      if (
        this.connection.readyState !== ConnectionStates.connected ||
        !this.connection.db
      ) {
        throw new Error('MongoDB connection is not ready');
      }

      await this.connection.db.admin().ping();

      return {
        status: 'ready',
        message: 'API is ready',
        checks: {
          mongodb: 'up',
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'unready',
        message: 'API is not ready',
        checks: {
          mongodb: 'down',
        },
      });
    }
  }
}
