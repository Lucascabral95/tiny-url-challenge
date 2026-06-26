export const CLICK_EVENTS_QUEUE_NAME = 'click-events';
export const TINY_URL_CLICKED_JOB_NAME = 'tiny-url-clicked';
export const CLICK_EVENT_PUBLISH_TIMEOUT_MS = 1_000;

export interface ClickEventPayload {
  eventId: string;
  code: string;
  clickedAt: string;
  ip?: string;
  userAgent?: string;
}
