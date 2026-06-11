import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UrlStats, UrlStatsDocument } from '../schemas/url-stats.schema';

@Injectable()
export class UrlStatsRepository {
  constructor(
    @InjectModel(UrlStats.name)
    private readonly urlStatsModel: Model<UrlStatsDocument>,
  ) {}

  async createInitialStats(code: string): Promise<void> {
    await this.urlStatsModel.create({
      code,
      totalClicks: 0,
      lastClick: null,
    });
  }
}
