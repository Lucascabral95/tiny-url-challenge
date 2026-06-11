import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullMqModule } from './infrastructure/queue/bullmq.module';
import { MongoModule } from './infrastructure/database/mongo.module';
import { ClickEventsModule } from './modules/click-events/click-events.module';

@Module({
  imports: [MongoModule, BullMqModule, ClickEventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
