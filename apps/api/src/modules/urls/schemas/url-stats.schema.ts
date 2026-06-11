import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UrlStatsDocument = HydratedDocument<UrlStats>;

@Schema({
  collection: 'url_stats',
  timestamps: true,
  versionKey: false,
})
export class UrlStats {
  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ default: 0, min: 0 })
  totalClicks!: number;

  @Prop({ type: Date, default: null })
  lastClick!: Date | null;

  createdAt!: Date;

  updatedAt!: Date;
}

export const UrlStatsSchema = SchemaFactory.createForClass(UrlStats);

UrlStatsSchema.index({ code: 1 }, { unique: true });
