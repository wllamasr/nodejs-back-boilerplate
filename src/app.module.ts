import { Module } from './core/decorators/module.decorator';
import { UsersModule } from './modules/users/users.module';
import { LoggerModule } from './core/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { RequestLoggerMiddleware } from './core/middlewares/request-logger.middleware';

@Module({
  imports: [UsersModule, LoggerModule, AuthModule],
  middlewares: [RequestLoggerMiddleware],
})
export class AppModule { }
