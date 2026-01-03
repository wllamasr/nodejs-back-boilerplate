import { createApp } from '@framework';
import { requestLogger } from '@framework/request-logger';
import { AppModule } from './app.module';
import { registerControllers, resolveControllers, registerMiddlewares, resolveMiddlewares } from '@/framework/bootstrap';

const app = createApp({
  middlewares: [requestLogger]
});

const controllers = resolveControllers(AppModule);
const middlewares = resolveMiddlewares(AppModule);

registerMiddlewares(app, middlewares);
registerControllers(app, controllers);

app.listen(3000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
