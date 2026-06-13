import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from './app.dto';

@Injectable()
export class AppService {
  getHealth(): HealthResponseDto {
    return {
      status: 'healthy',
      message: 'Health is ok',
    };
  }
}
