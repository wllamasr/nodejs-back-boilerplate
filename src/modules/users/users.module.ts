import { Module } from '@/core/decorators/module.decorator';
import { UserController } from './controllers/user.controller';

@Module({
  controllers: [UserController],
})
export class UsersModule { }
