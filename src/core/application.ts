import express, { Application as ExpressApp, Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { METADATA_KEYS } from './constants/metadata-keys';
import { RouteDefinition } from './decorators/http-methods.decorator';
import { LoggerService } from './logger/logger.service';

export class Application {
  private readonly app: ExpressApp;
  private readonly providers = new Map<any, any>();

  constructor(private readonly rootModule: any) {
    this.app = express();
    this.initializeMiddlewares();

    // Resolve all providers first (including factory providers)
    this.resolveProviders(rootModule);

    // Then resolve and register middlewares (which may depend on providers)
    const middlewares = this.resolveMiddlewares(rootModule);
    this.registerMiddlewares(middlewares);

    // Finally register controllers
    const controllers = this.resolveControllers(rootModule);
    this.registerControllers(controllers);

    // Add error handler
    this.app.use((err: any, req: any, res: any, next: any) => {
      console.error('Express error:', err);
      res.status(500).json({ error: err.message });
    });
  }

  private resolveMiddlewares(module: any): any[] {
    const middlewares = Reflect.getMetadata(METADATA_KEYS.MODULE_MIDDLEWARES, module) || [];
    const imports = Reflect.getMetadata('imports', module) || [];

    let allMiddlewares = [...middlewares];

    imports.forEach((importedModule: any) => {
      allMiddlewares = [...allMiddlewares, ...this.resolveMiddlewares(importedModule)];
    });

    return allMiddlewares;
  }

  private registerMiddlewares(middlewares: any[]) {
    middlewares.forEach((middlewareClass) => {
      // Check if middleware is already in providers (singleton), otherwise create new instance with DI
      let instance = this.providers.get(middlewareClass);
      if (!instance) {
        // Try to resolve dependencies for middleware
        const paramTypes = Reflect.getMetadata('design:paramtypes', middlewareClass) || [];
        const dependencies = paramTypes.map((token: any) => this.providers.get(token));

        instance = new middlewareClass(...dependencies);
        this.providers.set(middlewareClass, instance);
      }

      const path = Reflect.getMetadata(METADATA_KEYS.MIDDLEWARE, middlewareClass) || '*';

      if (path === '*') {
        this.app.use(instance.use.bind(instance));
      } else {
        this.app.use(path, instance.use.bind(instance));
      }
    });
  }

  private resolveProviders(module: any) {
    const providers = Reflect.getMetadata('providers', module) || [];
    const imports = Reflect.getMetadata('imports', module) || [];

    imports.forEach((importedModule: any) => {
      this.resolveProviders(importedModule);
    });

    providers.forEach((provider: any) => {
      if (typeof provider === 'function') {
        // Simple class provider
        if (!this.providers.has(provider)) {
          this.providers.set(provider, new provider());
        }
      } else if (provider.provide && provider.useFactory) {
        // Factory provider
        if (!this.providers.has(provider.provide)) {
          const injected = (provider.inject || []).map((token: any) => this.providers.get(token));
          const instance = provider.useFactory(...injected);
          this.providers.set(provider.provide, instance);
        }
      }
    });
  }

  private resolveControllers(module: any): any[] {
    const controllers = Reflect.getMetadata(METADATA_KEYS.MODULE_CONTROLLERS, module) || [];
    const imports = Reflect.getMetadata('imports', module) || [];

    let allControllers = [...controllers];

    imports.forEach((importedModule: any) => {
      allControllers = [...allControllers, ...this.resolveControllers(importedModule)];
    });

    return allControllers;
  }

  private initializeMiddlewares() {
    this.app.use(cors({
      origin: true,
      credentials: true,
    }));
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private registerControllers(controllers: any[]) {
    controllers.forEach((controllerClass) => {
      // Instantiate controller with dependencies
      // Note: This basic DI implementation assumes controllers don't have dependencies for now
      // or dependencies are manually handled. In a real DI system, we'd resolve them.
      // For this boilerplate, we'll assume controllers might need providers injected if we extended it.
      // But for now, let's just instantiate them.
      // Wait, we need to support DI in controllers too if we want to be like NestJS.
      // Let's try to resolve dependencies from providers.

      const paramTypes = Reflect.getMetadata('design:paramtypes', controllerClass) || [];
      const dependencies = paramTypes.map((token: any) => this.providers.get(token));

      const instance = new controllerClass(...dependencies);

      const prefix = Reflect.getMetadata(METADATA_KEYS.CONTROLLER, controllerClass);
      const routes: RouteDefinition[] = Reflect.getMetadata(METADATA_KEYS.ROUTES, controllerClass);

      if (routes) {
        routes.forEach((route) => {
          const routeHandler = instance[route.methodName].bind(instance);
          this.app[route.requestMethod](prefix + route.path, (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(routeHandler(req, res, next))
              .then((result) => {
                if (result !== undefined && !res.headersSent) {
                  res.json(result);
                }
              })
              .catch(next);
          });
        });
      }
    });
  }

  public listen(port: number) {
    this.app.listen(port, () => {
      const logger = this.providers.get(LoggerService);
      if (logger) {
        logger.log(`Server is running on port ${port}`);
      } else {
        console.log(`Server is running on port ${port}`);
      }
    });
  }
}
