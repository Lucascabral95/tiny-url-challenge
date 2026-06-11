import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClickEvent, ClickEventDocument } from '../schemas/click-event.schema';

export interface CreateClickEventRecord {
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

  async create(data: CreateClickEventRecord): Promise<void> {
    await this.clickEventModel.create(data);
  }
}
