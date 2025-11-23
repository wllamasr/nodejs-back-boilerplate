import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys';

export enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
}

export interface RouteDefinition {
  path: string;
  requestMethod: Methods;
  methodName: string | symbol;
}

function createRouteDecorator(method: Methods) {
  return (path: string = ''): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      if (!Reflect.hasMetadata(METADATA_KEYS.ROUTES, target.constructor)) {
        Reflect.defineMetadata(METADATA_KEYS.ROUTES, [], target.constructor);
      }

      const routes = Reflect.getMetadata(METADATA_KEYS.ROUTES, target.constructor) as RouteDefinition[];

      routes.push({
        requestMethod: method,
        path,
        methodName: propertyKey,
      });
      Reflect.defineMetadata(METADATA_KEYS.ROUTES, routes, target.constructor);
    };
  };
}

export const Get = createRouteDecorator(Methods.GET);
export const Post = createRouteDecorator(Methods.POST);
export const Put = createRouteDecorator(Methods.PUT);
export const Delete = createRouteDecorator(Methods.DELETE);
export const Patch = createRouteDecorator(Methods.PATCH);
