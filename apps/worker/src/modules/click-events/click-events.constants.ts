export const CLICK_EVENTS_QUEUE_NAME = 'click-events';
export const TINY_URL_CLICKED_JOB_NAME = 'tiny-url-clicked';

export interface ClickEventPayload {
  code: string;
  clickedAt: string;
  ip?: string;
  userAgent?: string;
}
