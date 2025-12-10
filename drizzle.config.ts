import type { Config } from 'drizzle-kit';
import { ConfigService } from './src/core/config/config.service';

const configService = new ConfigService();
const dbConfig = configService.get<any>('database');

export default {
  schema: './src/modules/**/models/*.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  },
} satisfies Config;
