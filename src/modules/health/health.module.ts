import { Module } from '@/core/decorators/module.decorator';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule { }
