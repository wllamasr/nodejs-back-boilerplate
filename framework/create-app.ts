import { Elysia } from 'elysia';

export interface AppConfig {
  controllers?: Record<string, any> | any[];
  middlewares?: any[];
}


export const createApp = (config: AppConfig) => {
  const app = new Elysia();

  // Register middlewares
  if (config.middlewares) {
    config.middlewares.forEach((middleware) => {
      app.use(middleware);
    });
  }

  // Register controllers
  if (config.controllers) {
    const controllers = Array.isArray(config.controllers)
      ? config.controllers
      : Object.values(config.controllers);

    controllers.forEach((controller) => {
      app.use(controller);
    });
  }

  return app;
};
