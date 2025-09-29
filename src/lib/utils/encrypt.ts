import { SignJWT } from 'jose';

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

export const encrypt = (payload: { [key: string]: string | Date }) => {
    return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(encodedKey);
};
