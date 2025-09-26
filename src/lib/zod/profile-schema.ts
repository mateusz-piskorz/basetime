import z from 'zod';

export const ACCEPTED_IMAGE_EXT = ['svg', 'jpeg', 'jpg', 'png', 'webp'];
const ACCEPTED_IMAGE_TYPES = ['image/svg+xml', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const updateProfileSchema = z.object({
    name: z.string().nonempty("Name can't be empty"),
});

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

export const deleteUserAccountSchema = z.object({
    password: z.string().nonempty("Password can't be empty"),
});

export const updateAvatarSchema = z.object({
    profile_img: z
        .instanceof(File)
        .refine((file) => file.size < 15000000, 'max file size is 15mb')
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), `Allowed file extensions: ${ACCEPTED_IMAGE_EXT.join(', ')}`)
        .nullable(),
});
