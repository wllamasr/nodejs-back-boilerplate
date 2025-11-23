import { Config } from './types';
import { baseConfig } from './base';

export const config: Config = {
  ...baseConfig,
  env: 'local',
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'express_boilerplate',
  },
  logger: {
    level: 'debug',
    fileLogging: false,
  },
  secrets: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
  },
} as Config;
