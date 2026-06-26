export const CLICK_EVENTS_QUEUE_NAME = 'click-events';
export const TINY_URL_CLICKED_JOB_NAME = 'tiny-url-clicked';
export const CLICK_EVENT_OUTBOX_POLL_INTERVAL_MS = 5_000;
export const CLICK_EVENT_OUTBOX_BATCH_SIZE = 10;
export const CLICK_EVENT_OUTBOX_MAX_ATTEMPTS = 5;
export const CLICK_EVENT_OUTBOX_RETRY_DELAY_MS = 10_000;
export const CLICK_EVENT_OUTBOX_LOCK_TIMEOUT_MS = 60_000;

export interface ClickEventPayload {
  eventId: string;
  code: string;
  clickedAt: string;
  ip?: string;
  userAgent?: string;
}
