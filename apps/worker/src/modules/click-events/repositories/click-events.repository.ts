import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClickEvent, ClickEventDocument } from '../schemas/click-event.schema';

export interface CreateClickEventRecord {
  eventId: string;
  code: string;
  clickedAt: Date;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class ClickEventsRepository {
  constructor(
    @InjectModel(ClickEvent.name)
    private readonly clickEventModel: Model<ClickEventDocument>,
  ) {}

  async create(data: CreateClickEventRecord): Promise<boolean> {
    try {
      await this.clickEventModel.create(data);
      return true;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        return false;
      }

      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    return 'code' in error && error.code === 11000;
  }
}
