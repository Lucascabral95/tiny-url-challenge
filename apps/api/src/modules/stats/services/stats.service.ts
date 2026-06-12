import { Injectable, NotFoundException } from '@nestjs/common';
import { StatsRepository } from '../repositories/stats.repository';

export interface StatsResponse {
  code: string;
  totalClicks: number;
  lastClick: Date | null;
}

@Injectable()
export class StatsService {
  constructor(private readonly statsRepository: StatsRepository) {}

  async getStats(code: string): Promise<StatsResponse> {
    const stats = await this.statsRepository.findByCode(code);

    if (!stats) {
      throw new NotFoundException('Stats not found');
    }

    return {
      code: stats.code,
      totalClicks: stats.totalClicks,
      lastClick: stats.lastClick,
    };
  }
}
