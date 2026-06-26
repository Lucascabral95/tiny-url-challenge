import { Module } from '@nestjs/common';
import { ClickEventsModule } from '../click-events/click-events.module';
import { UrlsModule } from '../urls/urls.module';
import { OpsController } from './controllers/ops.controller';
import { OpsService } from './services/ops.service';

@Module({
  imports: [ClickEventsModule, UrlsModule],
  controllers: [OpsController],
  providers: [OpsService],
})
export class OpsModule {}
