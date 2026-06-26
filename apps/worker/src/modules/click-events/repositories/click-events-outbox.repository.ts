import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CLICK_EVENT_OUTBOX_LOCK_TIMEOUT_MS,
  CLICK_EVENT_OUTBOX_MAX_ATTEMPTS,
  CLICK_EVENT_OUTBOX_RETRY_DELAY_MS,
} from '../click-events.constants';
import {
  ClickEventOutbox,
  ClickEventOutboxDocument,
} from '../schemas/click-event-outbox.schema';

export interface ClickEventOutboxRecord {
  id: string;
  eventId: string;
  code: string;
  clickedAt: Date;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class ClickEventsOutboxRepository {
  constructor(
    @InjectModel(ClickEventOutbox.name)
    private readonly clickEventOutboxModel: Model<ClickEventOutboxDocument>,
  ) {}

  async claimPending(limit: number): Promise<ClickEventOutboxRecord[]> {
    const records: ClickEventOutboxRecord[] = [];

    for (let index = 0; index < limit; index += 1) {
      const claimed = await this.claimOne();

      if (!claimed) {
        break;
      }

      records.push(this.toRecord(claimed));
    }

    return records;
  }

  async markProcessed(id: string): Promise<void> {
    await this.clickEventOutboxModel
      .updateOne(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            status: 'processed',
            processedAt: new Date(),
          },
          $unset: {
            lockedAt: '',
            nextRetryAt: '',
            lastError: '',
          },
        },
      )
      .exec();
  }

  async markFailed(id: string, error: unknown): Promise<void> {
    await this.clickEventOutboxModel
      .updateOne(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            status: 'failed',
            lockedAt: null,
            nextRetryAt: new Date(
              Date.now() + CLICK_EVENT_OUTBOX_RETRY_DELAY_MS,
            ),
            lastError: this.formatError(error),
          },
        },
      )
      .exec();
  }

  private async claimOne(): Promise<ClickEventOutboxDocument | null> {
    const now = new Date();
    const expiredLockDate = new Date(
      now.getTime() - CLICK_EVENT_OUTBOX_LOCK_TIMEOUT_MS,
    );

    return this.clickEventOutboxModel
      .findOneAndUpdate(
        {
          attempts: { $lt: CLICK_EVENT_OUTBOX_MAX_ATTEMPTS },
          $or: [
            { status: 'pending' },
            { status: 'failed', nextRetryAt: { $lte: now } },
            { status: 'processing', lockedAt: { $lte: expiredLockDate } },
          ],
        },
        {
          $set: {
            status: 'processing',
            lockedAt: now,
          },
          $inc: { attempts: 1 },
        },
        {
          sort: { createdAt: 1 },
          new: true,
        },
      )
      .exec();
  }

  private toRecord(document: ClickEventOutboxDocument): ClickEventOutboxRecord {
    return {
      id: document._id.toString(),
      eventId: document.eventId,
      code: document.code,
      clickedAt: document.clickedAt,
      ip: document.ip,
      userAgent: document.userAgent,
    };
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'unknown error';
  }
}
