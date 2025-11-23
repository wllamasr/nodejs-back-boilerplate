import { validate, ValidationError } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { Request, Response } from 'express';

/**
 * Validates the request body against a DTO class using class-validator.
 * If validation fails, returns a 400 response with error details.
 * If validation succeeds, replaces req.body with the validated DTO instance.
 */
export function ValidateBody(dto: ClassConstructor<any>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req, res]: [Request, Response] = args as [Request, Response];

      // Transform plain object to class instance
      const dtoInstance = plainToInstance(dto, req.body);

      // Validate
      const errors: ValidationError[] = await validate(dtoInstance);

      if (errors.length > 0) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.map(err => ({
            property: err.property,
            constraints: err.constraints,
            value: err.value,
          })),
        });
      }

      // Replace req.body with validated instance
      req.body = dtoInstance;

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validates query parameters against a DTO class.
 */
export function ValidateQuery(dto: ClassConstructor<any>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req, res]: [Request, Response] = args as [Request, Response];

      const dtoInstance = plainToInstance(dto, req.query);
      const errors: ValidationError[] = await validate(dtoInstance);

      if (errors.length > 0) {
        return res.status(400).json({
          message: 'Query validation failed',
          errors: errors.map(err => ({
            property: err.property,
            constraints: err.constraints,
            value: err.value,
          })),
        });
      }

      req.query = dtoInstance as any;

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validates route parameters against a DTO class.
 */
export function ValidateParams(dto: ClassConstructor<any>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req, res]: [Request, Response] = args as [Request, Response];

      const dtoInstance = plainToInstance(dto, req.params);
      const errors: ValidationError[] = await validate(dtoInstance);

      if (errors.length > 0) {
        return res.status(400).json({
          message: 'Params validation failed',
          errors: errors.map(err => ({
            property: err.property,
            constraints: err.constraints,
            value: err.value,
          })),
        });
      }

      req.params = dtoInstance as any;

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
