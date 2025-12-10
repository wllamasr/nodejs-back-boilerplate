import { Module } from '@/core/decorators/module.decorator';
import { TenantMiddleware } from './middlewares/tenant.middleware';

@Module({
  middlewares: [TenantMiddleware],
})
export class TenantsModule { }
