import { Module } from '../../core/decorators/module.decorator';
import { SendWelcomeEmail } from './jobs/email.job';

@Module({
  jobs: [SendWelcomeEmail],
})
export class NotificationsModule { }
