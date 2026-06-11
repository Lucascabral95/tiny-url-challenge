import { resolve } from 'node:path';
import { config } from 'dotenv';
import * as joi from 'joi';

config({ path: resolve(__dirname, '../../../../.env') });

interface EnvVars {
  MONGO_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
}

const envsSchema = joi
  .object<EnvVars>({
    MONGO_URI: joi.string().uri().required(),
    REDIS_HOST: joi.string().hostname().required(),
    REDIS_PORT: joi.number().port().required(),
  })
  .unknown(true);

const validationResult: joi.ValidationResult<EnvVars> = envsSchema.validate({
  ...process.env,
});

if (validationResult.error) {
  throw new Error(
    `Invalid environment variables: ${validationResult.error.message}`,
  );
}

const envVars = validationResult.value;

export const envs = {
  mongoUri: envVars.MONGO_URI,
  redisHost: envVars.REDIS_HOST,
  redisPort: envVars.REDIS_PORT,
};
