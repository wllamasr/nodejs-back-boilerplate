import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys';

export interface ModuleMetadata {
  controllers?: any[];
  providers?: any[];
  imports?: any[];
  middlewares?: any[];
}

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEYS.MODULE_CONTROLLERS, metadata.controllers || [], target);
    Reflect.defineMetadata(METADATA_KEYS.MODULE_MIDDLEWARES, metadata.middlewares || [], target);
    // We can store imports and providers if we want to expand dependency injection later
    Reflect.defineMetadata('imports', metadata.imports || [], target);
    Reflect.defineMetadata('providers', metadata.providers || [], target);
  };
}
