import { createApp } from '@framework';
import { requestLogger } from '@framework/request-logger';
import { controllers } from '@/modules';
import { registerControllers } from '@/framework/bootstrap';

const app = createApp({
  middlewares: [requestLogger]
});

registerControllers(app, controllers);

app.listen(3000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
