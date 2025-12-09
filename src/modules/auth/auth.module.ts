import { Module } from '@/core/decorators/module.decorator';
import { AuthController } from './controllers/auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule { }
