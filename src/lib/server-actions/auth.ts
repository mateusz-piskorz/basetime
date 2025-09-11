'use server';

import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/server-utils/get-client-ip';
import rateLimit from '@/lib/server-utils/rate-limit';
import { createSession, deleteSession, verifySession } from '@/lib/session';
import { loginSchema, logoutServerSchema, registerSchema } from '@/lib/zod/auth-schema';
import bcrypt from 'bcrypt';
import { headers } from 'next/headers';
import z from 'zod';

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

export const signup = async (data: z.infer<typeof registerSchema>) => {
    try {
        const clientIp = await getClientIp();
        const validated = registerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        if (!limiter.check(5, clientIp)) {
            return { success: false, message: 'Error limiter' };
        }
        const { email, password, name } = validated.data;

        if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
            return { success: false, message: 'Error provided email already exists in database' };
        }

        const pwHash = await bcrypt.hash(password, 9);

        const user = await prisma.user.create({
            data: {
                email,
                name: name || email,
                password: pwHash,
            },
            select: { id: true },
        });

        const userAgent = (await headers()).get('user-agent') || '';
        await createSession({ userAgent, userId: user.id });

        return { success: true };
    } catch (e) {
        console.log(e);
        return { success: false, message: 'Error something went wrong - signup' };
    }
};

export const signin = async (data: z.infer<typeof loginSchema>) => {
    try {
        const session = await verifySession();

        if (session) {
            return { success: true };
        }

        const clientIp = await getClientIp();
        const validated = loginSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        if (!limiter.check(5, clientIp)) {
            return { success: false, message: 'Error limiter' };
        }

        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { success: false, message: 'Error credentials incorrect' };
        }

        if (!(await bcrypt.compare(password, user?.password))) {
            return { success: false, message: 'Error credentials incorrect' };
        }

        const userAgent = (await headers()).get('user-agent') || '';

        await createSession({ userAgent, userId: user.id });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - signin' };
    }
};

export const logout = async ({ data }: { data: z.infer<typeof logoutServerSchema> }) => {
    try {
        const validated = logoutServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        await deleteSession(validated.data.sessionId);
        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - logout' };
    }
};
