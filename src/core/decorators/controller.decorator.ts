import 'reflect-metadata';

export const CONTROLLER_METADATA_KEY = 'controller:metadata';

export interface ControllerMetadata {
  prefix: string;
}

export function Controller(prefix: string = '/'): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(CONTROLLER_METADATA_KEY, { prefix }, target);
  };
}
