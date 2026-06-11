import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('WorkerBootstrap');
  const keepAliveInterval = setInterval(() => undefined, 60_000);

  app.enableShutdownHooks();

  process.once('SIGTERM', () => {
    clearInterval(keepAliveInterval);
  });

  process.once('SIGINT', () => {
    clearInterval(keepAliveInterval);
  });

  logger.log(
    `Worker started with Redis ${envs.redisHost}:${envs.redisPort} and MongoDB ${envs.mongoUri}`,
  );
}
void bootstrap();
