import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClickEventsRepository } from './repositories/click-events.repository';
import { ClickEvent, ClickEventSchema } from './schemas/click-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClickEvent.name, schema: ClickEventSchema },
    ]),
  ],
  providers: [ClickEventsRepository],
  exports: [ClickEventsRepository],
})
export class ClickEventsModule {}
