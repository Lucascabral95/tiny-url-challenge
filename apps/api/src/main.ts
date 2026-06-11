import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EXCLUDED_ROUTES_DETAILED } from './config/routes.config';
import { envs } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPrefix = 'api/v1';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: [envs.webOrigin],
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix, {
    exclude: EXCLUDED_ROUTES_DETAILED,
  });

  await app.listen(envs.apiPort);
}
void bootstrap();
