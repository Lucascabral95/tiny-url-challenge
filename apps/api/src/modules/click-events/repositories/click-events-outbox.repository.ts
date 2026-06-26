import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClickEventPayload } from '../click-events.constants';
import {
  ClickEventOutbox,
  ClickEventOutboxDocument,
} from '../schemas/click-event-outbox.schema';

export interface ClickEventOutboxStatusCounts {
  pending: number;
  processing: number;
  failed: number;
  dead: number;
  processed: number;
}

@Injectable()
export class ClickEventsOutboxRepository {
  constructor(
    @InjectModel(ClickEventOutbox.name)
    private readonly clickEventOutboxModel: Model<ClickEventOutboxDocument>,
  ) {}

  async createPending(payload: ClickEventPayload): Promise<void> {
    try {
      await this.clickEventOutboxModel.create({
        eventId: payload.eventId,
        code: payload.code,
        clickedAt: new Date(payload.clickedAt),
        ip: payload.ip,
        userAgent: payload.userAgent,
        status: 'pending',
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        return;
      }

      throw error;
    }
  }

  async countByStatus(): Promise<ClickEventOutboxStatusCounts> {
    const [pending, processing, failed, dead, processed] = await Promise.all([
      this.countByStatusValue('pending'),
      this.countByStatusValue('processing'),
      this.countByStatusValue('failed'),
      this.countByStatusValue('dead'),
      this.countByStatusValue('processed'),
    ]);

    return {
      pending,
      processing,
      failed,
      dead,
      processed,
    };
  }

  private async countByStatusValue(status: string): Promise<number> {
    return this.clickEventOutboxModel.countDocuments({ status }).exec();
  }

  private isDuplicateKeyError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    return 'code' in error && error.code === 11000;
  }
}
