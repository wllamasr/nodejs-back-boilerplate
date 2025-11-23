import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys';

export function Middleware(path: string = '*'): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEYS.MIDDLEWARE, path, target);
  };
}
