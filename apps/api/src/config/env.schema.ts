import { resolve } from 'node:path';
import { config } from 'dotenv';
import * as joi from 'joi';

config({ path: resolve(__dirname, '../../../../.env') });

interface EnvVars {
  API_PORT: number;
  WEB_PORT: number;
  MONGO_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  APP_BASE_URL: string;
}

const envsSchema = joi
  .object<EnvVars>({
    API_PORT: joi.number().port().required(),
    WEB_PORT: joi.number().port().required(),
    MONGO_URI: joi.string().uri().required(),
    REDIS_HOST: joi.string().hostname().required(),
    REDIS_PORT: joi.number().port().required(),
    APP_BASE_URL: joi.string().uri().required(),
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
  apiPort: envVars.API_PORT,
  webPort: envVars.WEB_PORT,
  mongoUri: envVars.MONGO_URI,
  redisHost: envVars.REDIS_HOST,
  redisPort: envVars.REDIS_PORT,
  appBaseUrl: envVars.APP_BASE_URL,
  webOrigin: `http://localhost:${envVars.WEB_PORT}`,
};
