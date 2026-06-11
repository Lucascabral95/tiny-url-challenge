import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { envs } from '../../config/env.schema';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: envs.redisHost,
        port: envs.redisPort,
      },
    }),
  ],
})
export class BullMqModule {}
