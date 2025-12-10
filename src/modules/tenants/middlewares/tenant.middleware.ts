import { eq } from 'drizzle-orm';
import { db } from '@framework/database';
import { domains } from '../models/domain.model';
import { tenants } from '../models/tenant.model';

export class TenantMiddleware {
  async handle(context: any) {
    const hostname = context.request.headers.get('host');
    if (!hostname) {
      return;
    }

    // Assuming format: subdomain.domain.tld
    // For localtest.me: subdomain.localtest.me
    const parts = hostname.split('.');
    if (parts.length < 3) {
      return;
    }

    const subdomain = parts[0];

    // Find domain
    const domainRecord = await db.select().from(domains).where(eq(domains.domain, subdomain));

    if (domainRecord.length > 0) {
      const tenantRecord = await db.select().from(tenants).where(eq(tenants.id, domainRecord[0].tenantId));
      if (tenantRecord.length > 0) {
        context.tenant = tenantRecord[0];
      }
    }
  }
}
