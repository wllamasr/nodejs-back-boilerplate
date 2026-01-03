import { Module } from '@/core/decorators/module.decorator';
import { LoggerModule } from '@/core/logger/logger.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [UsersModule, LoggerModule, AuthModule, NotificationsModule],
})
export class AppModule { }
