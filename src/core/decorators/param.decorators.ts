import 'reflect-metadata';

export const PARAM_METADATA_KEY = 'param:metadata';

export type ParamType = 'body' | 'query' | 'param' | 'headers' | 'cookie' | 'context';

export interface ParamMetadata {
  type: ParamType;
  index: number;
  data?: string;
}

function createParamDecorator(type: ParamType) {
  return (data?: string): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
      if (!propertyKey) return;
      const params: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target.constructor, propertyKey) || [];
      params.push({
        type,
        index: parameterIndex,
        data,
      });
      Reflect.defineMetadata(PARAM_METADATA_KEY, params, target.constructor, propertyKey);
    };
  };
}

export const Body = createParamDecorator('body');
export const Query = createParamDecorator('query');
export const Param = createParamDecorator('param');
export const Headers = createParamDecorator('headers');
export const Cookie = createParamDecorator('cookie');
export const Context = createParamDecorator('context');
