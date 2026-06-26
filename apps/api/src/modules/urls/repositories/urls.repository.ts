import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShortUrl, ShortUrlDocument } from '../schemas/short-url.schema';

export interface CreateShortUrlRecord {
  code: string;
  originalUrl: string;
  alias?: string;
}

export interface ShortUrlRecord {
  code: string;
  originalUrl: string;
  alias?: string;
}

@Injectable()
export class UrlsRepository {
  constructor(
    @InjectModel(ShortUrl.name)
    private readonly shortUrlModel: Model<ShortUrlDocument>,
  ) {}

  async create(data: CreateShortUrlRecord): Promise<ShortUrlRecord> {
    const createdShortUrl = await this.shortUrlModel.create(data);

    return {
      code: createdShortUrl.code,
      originalUrl: createdShortUrl.originalUrl,
      alias: createdShortUrl.alias,
    };
  }

  async findByCode(code: string): Promise<ShortUrlRecord | null> {
    const shortUrl = await this.shortUrlModel.findOne({ code }).exec();

    if (!shortUrl) {
      return null;
    }

    return {
      code: shortUrl.code,
      originalUrl: shortUrl.originalUrl,
      alias: shortUrl.alias,
    };
  }

  async existsByCode(code: string): Promise<boolean> {
    const shortUrl = await this.shortUrlModel.exists({ code }).exec();

    return shortUrl !== null;
  }
}
