# Validation Guide

## Overview

The project uses `class-validator` and `class-transformer` to provide declarative validation for request data. Validation is applied using decorators on controller methods.

## Validation Decorators

### @ValidateBody

Validates the request body against a DTO class.

```typescript
import { ValidateBody } from '../core/decorators/validate.decorator';
import { CreateUserDto } from '../dtos/create-user.dto';

@Post('/users')
@ValidateBody(CreateUserDto)
async create(req: Request, res: Response) {
  // req.body is validated and typed as CreateUserDto
  return this.userService.create(req.body);
}
```

### @ValidateQuery

Validates query parameters.

```typescript
@Get('/search')
@ValidateQuery(SearchQueryDto)
async search(req: Request, res: Response) {
  // req.query is validated
}
```

### @ValidateParams

Validates route parameters.

```typescript
@Get('/:id')
@ValidateParams(IdParamDto)
async findOne(req: Request, res: Response) {
  // req.params is validated
}
```

## Creating DTOs

DTOs (Data Transfer Objects) define the shape and validation rules for your data.

### Basic DTO

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}
```

**Note:** Use `!` (definite assignment assertion) for required properties to satisfy TypeScript's strict mode.

## Common Validators

### String Validators

```typescript
@IsString()
@MinLength(5)
@MaxLength(100)
@Matches(/^[a-zA-Z0-9]+$/)
title!: string;
```

### Number Validators

```typescript
@IsNumber()
@Min(0)
@Max(100)
age!: number;
```

### Type Validators

```typescript
@IsEmail()
email!: string;

@IsBoolean()
isActive!: boolean;

@IsDate()
birthDate!: Date;

@IsEnum(UserRole)
role!: UserRole;
```

### Array Validators

```typescript
@IsArray()
@ArrayMinSize(1)
@ArrayMaxSize(10)
tags!: string[];
```

### Conditional Validators

```typescript
@IsOptional()
middleName?: string;

@ValidateIf(o => o.email !== undefined)
@IsEmail()
email?: string;
```

## Custom Error Messages

Provide custom error messages for better UX:

```typescript
@IsEmail({}, { 
  message: 'Please provide a valid email address' 
})
email!: string;

@MinLength(8, { 
  message: 'Password must be at least $constraint1 characters long' 
})
password!: string;
```

**Variables in messages:**
- `$value` - The validated value
- `$property` - Property name
- `$target` - Target object
- `$constraint1`, `$constraint2`, etc. - Constraint parameters

## Validation Error Response

When validation fails, a 400 response is returned:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "property": "email",
      "constraints": {
        "isEmail": "Please provide a valid email address"
      },
      "value": "invalid-email"
    },
    {
      "property": "password",
      "constraints": {
        "minLength": "Password must be at least 8 characters long"
      },
      "value": "short"
    }
  ]
}
```

## Nested Validation

Validate nested objects:

```typescript
import { ValidateNested, Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street!: string;

  @IsString()
  city!: string;
}

class CreateUserDto {
  @IsEmail()
  email!: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}
```

## Custom Validators

Create custom validation logic:

```typescript
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must contain uppercase, lowercase, number, and special character';
  }
}

// Usage
export class CreateUserDto {
  @Validate(IsStrongPasswordConstraint)
  password!: string;
}
```

## Async Validators

Validate against database or external services:

```typescript
@ValidatorConstraint({ name: 'isEmailUnique', async: true })
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  async validate(email: string) {
    const user = await userService.findByEmail(email);
    return !user;
  }

  defaultMessage() {
    return 'Email already exists';
  }
}

// Usage
export class CreateUserDto {
  @Validate(IsEmailUniqueConstraint)
  email!: string;
}
```

## Transformation

Transform values before validation:

```typescript
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail()
  email!: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  name!: string;
}
```

## Validation Groups

Different validation rules for different scenarios:

```typescript
export class UserDto {
  @IsEmail({}, { groups: ['create', 'update'] })
  email!: string;

  @IsString({ groups: ['create'] })
  @MinLength(8, { groups: ['create'] })
  password!: string;
}

// In decorator
@ValidateBody(UserDto, { groups: ['create'] })
```

## Best Practices

1. **One DTO per operation** - Create separate DTOs for create, update, etc.
2. **Descriptive names** - Use clear DTO names like `CreateUserDto`, `UpdateUserDto`
3. **Custom messages** - Always provide user-friendly error messages
4. **Type safety** - Use `!` for required fields, `?` for optional
5. **Reuse validators** - Create custom validators for common patterns
6. **Document DTOs** - Add JSDoc comments to explain validation rules

## Example: Complete CRUD DTOs

```typescript
// create-user.dto.ts
export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email' })
  email!: string;

  @MinLength(8, { message: 'Password too short' })
  password!: string;

  @IsString()
  name!: string;
}

// update-user.dto.ts
export class UpdateUserDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;
}

// query-users.dto.ts
export class QueryUsersDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

## Testing Validation

```typescript
describe('Validation', () => {
  it('should reject invalid email', async () => {
    const response = await request(server)
      .post('/users')
      .send({ email: 'invalid', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });
});
```
