import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClickEventOutboxDocument = HydratedDocument<ClickEventOutbox>;
export const PROCESSED_CLICK_EVENT_OUTBOX_TTL_SECONDS = 60 * 60 * 24 * 7;

@Schema({
  collection: 'click_event_outbox',
  timestamps: true,
  versionKey: false,
})
export class ClickEventOutbox {
  @Prop({ required: true, trim: true })
  eventId!: string;

  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ required: true })
  clickedAt!: Date;

  @Prop({ trim: true })
  ip?: string;

  @Prop({ trim: true })
  userAgent?: string;

  @Prop({ required: true, default: 'pending' })
  status!: string;

  @Prop({ required: true, default: 0, min: 0 })
  attempts!: number;

  @Prop({ type: Date, default: null })
  lockedAt!: Date | null;

  @Prop({ type: Date, default: null })
  processedAt!: Date | null;

  @Prop({ type: Date, default: null })
  nextRetryAt!: Date | null;

  @Prop({ trim: true })
  lastError?: string;

  createdAt!: Date;

  updatedAt!: Date;
}

export const ClickEventOutboxSchema =
  SchemaFactory.createForClass(ClickEventOutbox);

ClickEventOutboxSchema.index(
  { eventId: 1 },
  {
    unique: true,
    partialFilterExpression: { eventId: { $type: 'string' } },
  },
);
ClickEventOutboxSchema.index({ status: 1, createdAt: 1 });
ClickEventOutboxSchema.index(
  { processedAt: 1 },
  {
    expireAfterSeconds: PROCESSED_CLICK_EVENT_OUTBOX_TTL_SECONDS,
    partialFilterExpression: { status: 'processed' },
  },
);
