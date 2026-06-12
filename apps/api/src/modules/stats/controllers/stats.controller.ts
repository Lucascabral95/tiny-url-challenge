import { Controller, Get, Param } from '@nestjs/common';
import { StatsResponse, StatsService } from '../services/stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get(':code')
  getStats(@Param('code') code: string): Promise<StatsResponse> {
    return this.statsService.getStats(code);
  }
}
