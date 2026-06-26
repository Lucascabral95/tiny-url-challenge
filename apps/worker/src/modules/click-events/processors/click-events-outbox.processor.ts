import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  CLICK_EVENT_OUTBOX_BATCH_SIZE,
  CLICK_EVENT_OUTBOX_POLL_INTERVAL_MS,
} from '../click-events.constants';
import { ClickEventsOutboxRepository } from '../repositories/click-events-outbox.repository';
import { ClickEventsService } from '../services/click-events.service';

@Injectable()
export class ClickEventsOutboxProcessor
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ClickEventsOutboxProcessor.name);
  private interval?: ReturnType<typeof setInterval>;
  private isDraining = false;

  constructor(
    private readonly clickEventsOutboxRepository: ClickEventsOutboxRepository,
    private readonly clickEventsService: ClickEventsService,
  ) {}

  onModuleInit(): void {
    void this.drain();
    this.interval = setInterval(() => {
      void this.drain();
    }, CLICK_EVENT_OUTBOX_POLL_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async drain(): Promise<void> {
    if (this.isDraining) {
      return;
    }

    this.isDraining = true;

    try {
      const records = await this.clickEventsOutboxRepository.claimPending(
        CLICK_EVENT_OUTBOX_BATCH_SIZE,
      );

      for (const record of records) {
        await this.processRecord(record);
      }
    } finally {
      this.isDraining = false;
    }
  }

  private async processRecord(record: {
    id: string;
    eventId: string;
    code: string;
    clickedAt: Date;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await this.clickEventsService.registerClick({
        eventId: record.eventId,
        code: record.code,
        clickedAt: record.clickedAt.toISOString(),
        ip: record.ip,
        userAgent: record.userAgent,
      });
      await this.clickEventsOutboxRepository.markProcessed(record.id);
    } catch (error) {
      this.logger.warn(
        `Failed to process click outbox ${record.id}: ${this.formatError(error)}`,
      );
      await this.clickEventsOutboxRepository.markFailed(record.id, error);
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'unknown error';
  }
}
