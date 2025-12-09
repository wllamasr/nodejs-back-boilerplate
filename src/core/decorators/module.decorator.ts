import 'reflect-metadata';
import { JobDefinition } from '../../../framework/queue';

export interface ModuleMetadata {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  middlewares?: any[];
  jobs?: JobDefinition<any>[];
}

export const MODULE_METADATA_KEY = 'module:metadata';

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(MODULE_METADATA_KEY, metadata, target);
  };
}
