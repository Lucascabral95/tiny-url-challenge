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

  async registerClick(code: string, clickedAt: Date): Promise<void> {
    await this.urlStatsModel
      .updateOne(
        { code },
        {
          $inc: { totalClicks: 1 },
          $set: { lastClick: clickedAt },
        },
        { upsert: true },
      )
      .exec();
  }
}
