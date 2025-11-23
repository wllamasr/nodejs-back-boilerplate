import { Config } from './types';
import { config as localConfig } from './local';

export const config: Config = {
  ...localConfig,
  env: 'test',
  logger: {
    level: 'error',
    fileLogging: false,
  },
  secrets: {
    jwtSecret: process.env.JWT_SECRET || 'test-secret-key',
  },
} as Config;
