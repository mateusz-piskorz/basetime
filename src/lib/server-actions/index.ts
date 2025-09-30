/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';
import { getSession } from '../session'; // adjust this import!

export function action<T extends z.ZodType, H extends (validated: z.infer<T>, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) => any>(
    schema: T,
    handler: H,
): (data: z.infer<T>) => Promise<Awaited<ReturnType<H>>> {
    return async (data: z.infer<T>) => {
        const validated = schema.safeParse(data);
        if (!validated.success) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        return handler(validated.data, session);
    };
}
