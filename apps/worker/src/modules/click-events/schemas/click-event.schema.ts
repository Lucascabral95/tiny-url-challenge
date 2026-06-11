import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClickEventDocument = HydratedDocument<ClickEvent>;

@Schema({
  collection: 'click_events',
  timestamps: true,
  versionKey: false,
})
export class ClickEvent {
  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ required: true })
  clickedAt!: Date;

  @Prop({ trim: true })
  ip?: string;

  @Prop({ trim: true })
  userAgent?: string;
}

export const ClickEventSchema = SchemaFactory.createForClass(ClickEvent);

ClickEventSchema.index({ code: 1 });
ClickEventSchema.index({ clickedAt: -1 });
ClickEventSchema.index({ code: 1, clickedAt: -1 });
