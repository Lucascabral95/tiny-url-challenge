import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('WorkerBootstrap');

  app.enableShutdownHooks();

  logger.log(
    `Worker started with Redis ${envs.redisHost}:${envs.redisPort} and MongoDB ${envs.mongoUri}`,
  );
}
void bootstrap();
