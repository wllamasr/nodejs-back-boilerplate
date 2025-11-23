import { Config } from './types';
import { baseConfig } from './base';

export const config: Config = {
  ...baseConfig,
  env: 'production',
  database: {
    host: process.env.DB_HOST || 'prod-db-host',
    user: process.env.DB_USER || 'prod-user',
    password: process.env.DB_PASSWORD || 'prod-password',
    database: process.env.DB_NAME || 'express_boilerplate_prod',
  },
  logger: {
    level: 'error',
    fileLogging: true,
  },
} as Config;
