import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  name: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
