import { Injectable } from '@nestjs/common';
import { ClickEventPayload } from '../click-events.constants';
import { ClickEventsRepository } from '../repositories/click-events.repository';
import { UrlStatsRepository } from '../repositories/url-stats.repository';

@Injectable()
export class ClickEventsService {
  constructor(
    private readonly clickEventsRepository: ClickEventsRepository,
    private readonly urlStatsRepository: UrlStatsRepository,
  ) {}

  async registerClick(payload: ClickEventPayload): Promise<void> {
    const clickedAt = new Date(payload.clickedAt);
    const wasCreated = await this.clickEventsRepository.create({
      eventId: payload.eventId,
      code: payload.code,
      clickedAt,
      ip: payload.ip,
      userAgent: payload.userAgent,
    });

    if (!wasCreated) {
      return;
    }

    await this.urlStatsRepository.registerClick(payload.code, clickedAt);
  }
}
