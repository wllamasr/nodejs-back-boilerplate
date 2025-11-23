import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys';

export function Controller(prefix: string = ''): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEYS.CONTROLLER, prefix, target);
  };
}
