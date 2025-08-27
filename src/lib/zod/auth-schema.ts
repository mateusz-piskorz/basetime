import z from 'zod';

export const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().nonempty("Password can't be empty"),
});

export const registerSchema = z.object({
    name: z.string().nullish(),
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
