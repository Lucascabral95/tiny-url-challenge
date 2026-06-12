import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UrlStats,
  UrlStatsDocument,
} from '../../urls/schemas/url-stats.schema';

export interface UrlStatsRecord {
  code: string;
  totalClicks: number;
  lastClick: Date | null;
}

@Injectable()
export class StatsRepository {
  constructor(
    @InjectModel(UrlStats.name)
    private readonly urlStatsModel: Model<UrlStatsDocument>,
  ) {}

  async findByCode(code: string): Promise<UrlStatsRecord | null> {
    const stats = await this.urlStatsModel.findOne({ code }).exec();

    if (!stats) {
      return null;
    }

    return {
      code: stats.code,
      totalClicks: stats.totalClicks,
      lastClick: stats.lastClick,
    };
  }
}
