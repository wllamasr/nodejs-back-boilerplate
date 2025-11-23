import { Config } from './types';
import { baseConfig } from './base';

export const config: Config = {
  ...baseConfig,
  env: 'development',
  database: {
    host: process.env.DB_HOST || 'dev-db-host',
    user: process.env.DB_USER || 'dev-user',
    password: process.env.DB_PASSWORD || 'dev-password',
    database: process.env.DB_NAME || 'express_boilerplate_dev',
  },
  logger: {
    level: 'info',
    fileLogging: true,
  },
} as Config;
