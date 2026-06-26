import {
  ClickEventOutboxSchema,
  PROCESSED_CLICK_EVENT_OUTBOX_TTL_SECONDS,
} from './click-event-outbox.schema';

describe('ClickEventOutboxSchema', () => {
  it('should expire processed outbox events after the retention window', () => {
    const indexes = ClickEventOutboxSchema.indexes();

    expect(indexes).toContainEqual([
      { processedAt: 1 },
      {
        expireAfterSeconds: PROCESSED_CLICK_EVENT_OUTBOX_TTL_SECONDS,
        partialFilterExpression: { status: 'processed' },
      },
    ]);
  });
});
