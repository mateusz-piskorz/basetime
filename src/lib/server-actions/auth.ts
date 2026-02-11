'use server';

import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/server-utils/get-client-ip';
import rateLimit from '@/lib/server-utils/rate-limit';
import { createSession, deleteSession, getSession, setSessionCookie } from '@/lib/session';
import { loginSchema, registerSchema } from '@/lib/zod/auth-schema';
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
        if (!limiter.check(5, clientIp)) return { success: false, message: 'Error limiter' };

        const validated = registerSchema.safeParse(data);
        if (validated.error) return { success: false, message: 'Error validating fields' };
        const { email, password, name } = validated.data;

        if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
            return { success: false, message: 'Error provided email already exists in database' };
        }

        const user = await prisma.user.create({
            data: {
                email,
                name: name || email,
                password: await bcrypt.hash(password, 9),
            },
            select: { id: true },
        });

        await createSession({ userAgent: (await headers()).get('user-agent') || '', userId: user.id });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - signup' };
    }
};

export const signin = async (data: z.infer<typeof loginSchema>) => {
    try {
        const session = await getSession();

        if (session) {
            await setSessionCookie(session.cookie);
            return { success: true };
        }

        if (!limiter.check(5, await getClientIp())) return { success: false, message: 'Error limiter' };

        const validated = loginSchema.safeParse(data);
        if (validated.error) return { success: false, message: 'Error validating fields' };
        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return { success: false, message: 'Error credentials incorrect' };
        if (!(await bcrypt.compare(password, user?.password))) return { success: false, message: 'Error credentials incorrect' };

        await createSession({ userAgent: (await headers()).get('user-agent') || '', userId: user.id });

        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error - signin' };
    }
};

const logoutSchema = z.object({ sessionId: z.string().optional() });
export const logout = async (data: z.infer<typeof logoutSchema>) => {
    try {
        const validated = logoutSchema.safeParse(data);

        if (validated.error) return { success: false, message: 'Error validating fields' };

        await deleteSession(validated.data.sessionId);
        return { success: true };
    } catch {
        return { success: false, message: 'Error - logout' };
    }
};
