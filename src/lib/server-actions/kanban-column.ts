'use server';

import { prisma } from '../prisma';
import { createKanbanColumnSchemaS, deleteKanbanColumnSchemaS, updateKanbanColumnSchemaS } from '../zod/kanban-column-schema';
import { action } from './_utils';

export const createKanbanColumn = action(createKanbanColumnSchemaS, async ({ color, name, order, orgId }, { userId }) => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.kanbanColumn.updateMany({
                where: {
                    Organization: { id: orgId, Members: { some: { userId, role: { in: ['MANAGER', 'OWNER'] } } } },
                    order: { gte: order },
                },
                data: { order: { increment: 1 } },
            });

            await tx.kanbanColumn.create({
                data: {
                    order,
                    name,
                    color,
                    Organization: { connect: { id: orgId, Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
                },
            });
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - createKanbanColumn' };
    }
});

export const updateKanbanColumn = action(updateKanbanColumnSchemaS, async ({ name, color, order, columnId }, { userId }) => {
    try {
        await prisma.$transaction(async (tx) => {
            const currentColumn = await tx.kanbanColumn.findUnique({
                where: { id: columnId, Organization: { Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
                select: { order: true, organizationId: true },
            });

            if (!currentColumn) return { success: false, message: 'Error - permissions' };
            const { organizationId } = currentColumn;

            if (order !== undefined && order !== currentColumn.order) {
                // lower order value
                if (order < currentColumn.order) {
                    await tx.kanbanColumn.updateMany({
                        where: {
                            organizationId,
                            order: { gte: order, lt: currentColumn.order },
                        },
                        data: { order: { increment: 1 } },
                    });
                }
                // higher order value
                else if (order > currentColumn.order) {
                    await tx.kanbanColumn.updateMany({
                        where: {
                            organizationId,
                            order: { gt: currentColumn.order, lte: order },
                        },
                        data: { order: { decrement: 1 } },
                    });
                }
            }

            // Update the column itself
            await tx.kanbanColumn.update({
                where: { id: columnId },
                data: { name, color, order },
            });
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - updateKanbanColumn' };
    }
});

export const deleteKanbanColumn = action(deleteKanbanColumnSchemaS, async ({ columnId }, { userId }) => {
    try {
        await prisma.$transaction(async (tx) => {
            const deletedColumn = await tx.kanbanColumn.findUnique({
                where: { id: columnId, Organization: { Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
                select: { order: true, organizationId: true },
            });

            if (!deletedColumn) return { success: false, message: 'Error - permissions' };
            const { organizationId } = deletedColumn;

            await tx.kanbanColumn.delete({ where: { id: columnId } });

            await tx.kanbanColumn.updateMany({
                where: {
                    organizationId,
                    order: { gt: deletedColumn.order },
                },
                data: { order: { decrement: 1 } },
            });
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - deleteKanbanColumn' };
    }
});
