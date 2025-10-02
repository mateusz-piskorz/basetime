import z from 'zod';

export const updateProfileSchema = z.object({ name: z.string().nonempty("Name can't be empty") });

export const updatePasswordSchema = z
    .object({
        current_password: z.string().nonempty(),
        password: z.string().nonempty(),
        password_confirmation: z.string().nonempty(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
    });

export const deleteUserAccountSchema = z.object({ password: z.string().nonempty("Password can't be empty") });
