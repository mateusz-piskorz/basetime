'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { createProjectServerSchema, deleteProjectServerSchema } from '../zod/project-schema';

export const upsertProject = async ({ data }: { data: z.infer<typeof createProjectServerSchema> }) => {
    try {
        const validated = createProjectServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { memberIds, name, estimatedMinutes, color, organizationId, projectId } = validated.data;

        const userMember = await prisma.member.findFirst({ where: { userId: session.id, organizationId, role: { in: ['MANAGER', 'OWNER'] } } });
        if (!userMember) {
            return { success: false, message: `Error: permission` };
        }

        await prisma.project.upsert({
            where: { id: projectId || '' },
            update: {
                name,
                color,
                estimatedMinutes,
                Members: { connect: memberIds?.map((id) => ({ id })) },
                organizationId,
            },
            create: {
                name,
                color,
                estimatedMinutes,
                Members: { connect: memberIds?.map((id) => ({ id })) },
                organizationId,
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - upsertProject' };
    }
};

export const deleteProject = async ({ data }: { data: z.infer<typeof deleteProjectServerSchema> }) => {
    try {
        const validated = deleteProjectServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.project.delete({
            where: { id: validated.data.projectId, Organization: { Members: { some: { userId: session.id, role: { in: ['MANAGER', 'OWNER'] } } } } },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - deleteProject' };
    }
};
