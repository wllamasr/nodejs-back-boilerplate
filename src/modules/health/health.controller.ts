import { Controller } from '@/core/decorators/controller.decorator';
import { Get } from '@/core/decorators/route.decorators';
import { client } from '@framework';
import redisClient from '@framework/cache';


@Controller('/healthcheck')
export class HealthController {
  @Get('')
  async health() {
    return { ok: true, database: await this.checkDb(), redis: await this.checkRedis() };
  }

  private async checkDb() {
    try {
      await client`SELECT 1`;
      return true;
    } catch (e) {
      return false;
    }
  }

  private async checkRedis() {
    try {
      await redisClient.ping();
      return true;
    } catch (e) {
      return false;
    }
  }
}
