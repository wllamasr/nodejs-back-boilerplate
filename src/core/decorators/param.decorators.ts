import 'reflect-metadata';

import { ZodSchema } from 'zod';

export const PARAM_METADATA_KEY = 'param:metadata';

export type ParamType = 'body' | 'query' | 'param' | 'headers' | 'cookie' | 'context';

export interface ParamMetadata {
  type: ParamType;
  index: number;
  data?: string;
  schema?: ZodSchema;
}

function createParamDecorator(type: ParamType) {
  return (dataOrSchema?: string | ZodSchema): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
      if (!propertyKey) return;

      let data: string | undefined;
      let schema: ZodSchema | undefined;

      if (typeof dataOrSchema === 'string') {
        data = dataOrSchema;
      } else if (dataOrSchema && typeof dataOrSchema === 'object') {
        schema = dataOrSchema as ZodSchema;
      }

      const params: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target.constructor, propertyKey) || [];
      params.push({
        type,
        index: parameterIndex,
        data,
        schema
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
