import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './infrastructure/database/mongo.module';
import { UrlsModule } from './modules/urls/urls.module';

@Module({
  imports: [MongoModule, UrlsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
