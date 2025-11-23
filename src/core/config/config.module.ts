import { Module } from '../decorators/module.decorator';
import { ConfigService } from './config.service';

@Module({
  providers: [ConfigService],
})
export class ConfigModule { }
