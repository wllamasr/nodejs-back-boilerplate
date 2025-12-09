import 'reflect-metadata';

export const ROUTE_METADATA_KEY = 'route:metadata';

export interface RouteMetadata {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  handlerName: string | symbol;
}

function createRouteDecorator(method: RouteMetadata['method']) {
  return (path: string = '/'): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
      routes.push({
        method,
        path,
        handlerName: propertyKey,
      });
      Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
    };
  };
}

export const Get = createRouteDecorator('get');
export const Post = createRouteDecorator('post');
export const Put = createRouteDecorator('put');
export const Delete = createRouteDecorator('delete');
export const Patch = createRouteDecorator('patch');
