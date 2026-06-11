import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ShortUrlDocument = HydratedDocument<ShortUrl>;

@Schema({
  collection: 'short_urls',
  timestamps: true,
  versionKey: false,
})
export class ShortUrl {
  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ required: true, trim: true })
  originalUrl!: string;

  @Prop({ trim: true })
  alias?: string;

  createdAt!: Date;

  updatedAt!: Date;
}

export const ShortUrlSchema = SchemaFactory.createForClass(ShortUrl);

ShortUrlSchema.index({ code: 1 }, { unique: true });
ShortUrlSchema.index({ alias: 1 }, { unique: true, sparse: true });
