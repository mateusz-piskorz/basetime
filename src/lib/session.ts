/* eslint-disable @typescript-eslint/no-unused-vars */
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';
import { prisma } from './prisma';
import { encrypt } from './utils/encrypt';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

const decrypt = async (session: string | undefined = '') => {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch {}
};

type CreateSession = { userId: string; userAgent: string };

export async function createSession({ userId, userAgent }: CreateSession) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

export async function deleteSession(sessionId?: string) {
    if (sessionId) {
        await prisma.session.update({
            where: { id: sessionId as string, expiresAt: { gte: new Date() } },
            data: { expiresAt: new Date(Date.now() - 1000) },
        });
        return;
    }

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
        select: { id: true, User: { select: { id: true, email: true, name: true } } },
    });

    if (!res) {
        return null;
    }
    const { id, ...userInfo } = res.User;
    return { ...userInfo, userId: res.User.id, sessionId: res.id, cookie };
});

export const setSessionCookie = async (cookie: string) => {
    try {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const cookieStore = await cookies();
        cookieStore.set('session', cookie, {
            httpOnly: true,
            secure: true,
            expires,
            sameSite: 'lax',
            path: '/',
        });

        return { success: true };
    } catch {
        return { success: false };
    }
};
