import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  name: z.string(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
