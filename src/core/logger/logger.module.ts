import { Module } from '../decorators/module.decorator';
import { LoggerService } from './logger.service';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: LoggerService,
      useFactory: (configService: ConfigService) => new LoggerService(configService),
      inject: [ConfigService],
    },
  ],
})
export class LoggerModule { }
