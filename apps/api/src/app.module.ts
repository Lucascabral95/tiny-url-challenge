import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullMqModule } from './infrastructure/queue/bullmq.module';
import { MongoModule } from './infrastructure/database/mongo.module';
import { OpsModule } from './modules/ops/ops.module';
import { StatsModule } from './modules/stats/stats.module';
import { UrlsModule } from './modules/urls/urls.module';

@Module({
  imports: [MongoModule, BullMqModule, UrlsModule, StatsModule, OpsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
