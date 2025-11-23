import * as dotenv from 'dotenv';
import * as path from 'path';
import { Config } from '../../config/types';

export class ConfigService {
  private config: Config;

  constructor() {
    const nodeEnv = process.env.NODE_ENV || 'local';
    // Load .env file for secrets
    dotenv.config();

    // Load environment specific config
    const envConfigPath = path.resolve(process.cwd(), 'src', 'config', `${nodeEnv}.ts`);
    // In a real build, this would need to handle compiled JS files. 
    // For ts-node/dev, we can require the TS file if we register ts-node, or rely on the build process.
    // Since we are running with nodemon/ts-node, we can import it.
    // However, dynamic imports are async. For simplicity in this boilerplate, let's use require.
    // Note: In production build, these files should be compiled to JS.

    try {
      // Using require to load the config file synchronously
      // We assume the build process handles the file extension change or we check for both
      const configFile = require(`../../config/${nodeEnv}`);
      this.config = configFile.config;
    } catch (error) {
      console.error(`Failed to load configuration for environment: ${nodeEnv}`, error);
      throw new Error(`Configuration file not found for environment: ${nodeEnv}`);
    }
  }

  get<T>(key: keyof Config): T {
    return this.config[key] as T;
  }

  get nodeEnv(): string {
    return this.config.env;
  }
}
