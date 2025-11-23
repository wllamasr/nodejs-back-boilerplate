import { Module } from '../../core/decorators/module.decorator';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '../../core/config/config.module';
import { UserService } from '../users/services/user.service';
import { ConfigService } from '../../core/config/config.service';
import { AuthController } from './controllers/auth.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [UsersModule, ConfigModule],
  controllers: [AuthController],
  middlewares: [AuthMiddleware],
  providers: [
    {
      provide: AuthService,
      useFactory: (userService: UserService, configService: ConfigService) =>
        new AuthService(userService, configService),
      inject: [UserService, ConfigService],
    },
  ],
})
export class AuthModule { }
