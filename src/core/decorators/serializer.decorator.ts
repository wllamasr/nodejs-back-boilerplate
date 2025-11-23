import { ClassConstructor, plainToInstance } from 'class-transformer';

/**
 * Serializes the response using the provided DTO class.
 * Transforms the result to an instance of the DTO and excludes properties not marked with @Expose.
 */
export function Serializer(dto: ClassConstructor<any>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      return plainToInstance(dto, result, {
        excludeExtraneousValues: true,
      });
    };

    return descriptor;
  };
}

/**
 * @deprecated Use Serializer instead
 */
export const Serialize = Serializer;
