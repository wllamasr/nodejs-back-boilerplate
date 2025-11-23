export interface DatabaseConfig {
  host: string;
  user: string;
  password?: string;
  database: string;
}

export interface LoggerConfig {
  level: string;
  fileLogging: boolean;
}

export interface Config {
  env: string;
  port: number;
  database: DatabaseConfig;
  logger: LoggerConfig;
  secrets: {
    jwtSecret?: string;
  };
}
