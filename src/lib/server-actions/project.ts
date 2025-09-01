'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { createProjectServerSchema } from '../zod/project-schema';

export const createProject = async ({ data, organizationId }: { data: z.infer<typeof createProjectServerSchema>; organizationId: string }) => {
    try {
        const validated = createProjectServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { memberIds, name, estimatedMinutes, color } = validated.data;

        await prisma.project.create({
            data: {
                name,
                color,
                estimatedMinutes,
                Members: { connect: memberIds?.map((id) => ({ id })) },
                organizationId,
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - createProject' };
    }
};
