import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';
import { prisma } from './prisma';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

const encrypt = (payload: { [key: string]: string | Date }) => {
    return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(encodedKey);
};

const decrypt = async (session: string | undefined = '') => {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch {
        console.log('Failed to verify session');
    }
};

type CreateSession = { userId: string; userAgent: string };

export async function createSession({ userId, userAgent }: CreateSession) {
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    const sessionId = (await prisma.session.create({ data: { expiresAt, userAgent, userId } })).id;

    const session = await encrypt({ sessionId, expiresAt });
    const cookieStore = await cookies();

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.sessionId) {
        return;
    }

    await prisma.session.update({
        where: { id: session.sessionId as string, expiresAt: { gte: new Date() } },
        data: { expiresAt: new Date(Date.now() - 1000) },
    });

    cookieStore.delete('session');
}

/**
 * use in server-components
 */

export const getSession = cache(async () => {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!cookie || !session?.sessionId) {
        return null;
    }

    const res = await prisma.session.findUnique({
        where: { id: session.sessionId as string, expiresAt: { gte: new Date() } },
        select: { id: true, user: { select: { id: true, email: true, name: true } } },
    });

    if (!res) {
        return null;
    }

    return { ...res.user, sessionId: res.id };
});

/**
 * use in server-actions and route-handlers(trpc)
 */

export const verifySession = async () => {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = await decrypt(cookie);

        if (!cookie || !session?.sessionId) {
            return null;
        }

        const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);

        const res = await prisma.session.update({
            where: { id: session.sessionId as string, expiresAt: { gte: new Date() } },
            select: { id: true, user: { select: { id: true, email: true, name: true } } },
            data: { expiresAt: expires },
        });
        if (!res) {
            return null;
        }

        const cookieStore = await cookies();
        cookieStore.set('session', cookie, {
            httpOnly: true,
            secure: true,
            expires,
            sameSite: 'lax',
            path: '/',
        });

        return { ...res.user, sessionId: res.id };
    } catch {
        return null;
    }
};
