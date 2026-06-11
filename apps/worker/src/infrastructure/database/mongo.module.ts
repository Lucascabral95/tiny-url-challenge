import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from '../../config/env.schema';

@Module({
  imports: [MongooseModule.forRoot(envs.mongoUri)],
})
export class MongoModule {}
