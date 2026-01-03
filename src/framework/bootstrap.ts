import { Elysia } from 'elysia';
import 'reflect-metadata';
import { CONTROLLER_METADATA_KEY, ControllerMetadata } from '../core/decorators/controller.decorator';
import { ROUTE_METADATA_KEY, RouteMetadata } from '../core/decorators/route.decorators';
import { PARAM_METADATA_KEY, ParamMetadata } from '../core/decorators/param.decorators';
import { Container } from '../core/di/container';
import { MODULE_METADATA_KEY, ModuleMetadata } from '../core/decorators/module.decorator';

export function registerControllers(app: Elysia, controllers: any[]) {
  controllers.forEach((ControllerClass) => {
    const instance = Container.get(ControllerClass);
    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA_KEY, ControllerClass);
    const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, ControllerClass) || [];

    if (!controllerMetadata) {
      return;
    }

    const prefix = controllerMetadata.prefix;

    // Create a sub-app (plugin) for the controller to handle the prefix
    const plugin = new Elysia({ prefix });

    routes.forEach((route) => {
      // Pre-calculate params metadata at startup time
      const params: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, ControllerClass, route.handlerName) || [];
      // Sort params by index to ensure correct order
      params.sort((a, b) => a.index - b.index);

      const handler = async (context: any) => {
        const args: any[] = [];

        for (const param of params) {
          switch (param.type) {
            case 'body':
              args[param.index] = param.data ? context.body[param.data] : context.body;
              break;
            case 'query':
              args[param.index] = param.data ? context.query[param.data] : context.query;
              break;
            case 'param':
              args[param.index] = param.data ? context.params[param.data] : context.params;
              break;
            case 'headers':
              args[param.index] = param.data ? context.headers[param.data] : context.headers;
              break;
            case 'cookie':
              args[param.index] = param.data ? context.cookie[param.data] : context.cookie;
              break;
            case 'context':
              args[param.index] = context;
              break;
          }
        }

        // Call the controller method with injected arguments
        return (instance as any)[route.handlerName](...args);
      };

      // Register the route with the plugin
      (plugin as any)[route.method](route.path, handler);
    });

    // Register the plugin with the main app
    app.use(plugin);
  });
}

export function registerMiddlewares(app: Elysia, middlewares: any[]) {
  middlewares.forEach((MiddlewareClass) => {
    const instance = Container.get(MiddlewareClass);
    if ((instance as any).handle) {
      // Bind the handle method to the instance to preserve 'this' context
      app.use((instance as any).handle.bind(instance));
    }
  });
}

export function resolveControllers(module: any, controllers = new Set<any>(), visited = new Set<any>()): any[] {
  if (visited.has(module)) return Array.from(controllers);
  visited.add(module);

  const metadata: ModuleMetadata = Reflect.getMetadata(MODULE_METADATA_KEY, module);

  if (metadata) {
    if (metadata.controllers) {
      metadata.controllers.forEach((c: any) => controllers.add(c));
    }
    if (metadata.imports) {
      metadata.imports.forEach((m: any) => resolveControllers(m, controllers, visited));
    }
  }
  return Array.from(controllers);
}

export function resolveMiddlewares(module: any, middlewares = new Set<any>(), visited = new Set<any>()): any[] {
  if (visited.has(module)) return Array.from(middlewares);
  visited.add(module);

  const metadata: ModuleMetadata = Reflect.getMetadata(MODULE_METADATA_KEY, module);

  if (metadata) {
    if (metadata.middlewares) {
      metadata.middlewares.forEach((m: any) => middlewares.add(m));
    }
    if (metadata.imports) {
      metadata.imports.forEach((m: any) => resolveMiddlewares(m, middlewares, visited));
    }
  }
  return Array.from(middlewares);
}
