import * as winston from 'winston';
import * as path from 'path';
import { ConfigService } from '../config/config.service';

export class LoggerService {
  private logger!: winston.Logger;

  constructor(private configService: ConfigService) {
    this.initializeLogger();
  }

  private initializeLogger() {
    const loggerConfig = this.configService.get<any>('logger');
    const transports: winston.transport[] = [];

    if (!loggerConfig.fileLogging) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} [${level}]: ${message}`;
            }),
          ),
        }),
      );
    } else {
      transports.push(
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
        }),
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'combined.log'),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: loggerConfig.level,
      format: winston.format.json(),
      transports,
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
