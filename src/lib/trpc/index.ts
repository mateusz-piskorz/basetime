// import { z } from "zod";
import { prisma } from '../prisma';
import { createTRPCRouter, publicProcedure } from './init';

export const appRouter = createTRPCRouter({
    getUsers: publicProcedure.query(async () => {
        return await prisma.user.findMany();
    }),
    //   addTodo: publicProcedure.input(z.string()).mutation(async (opts) => {
    //     await db.insert(todos).values({ content: opts.input, done: 0 }).run();
    //     return true;
    //   }),
    //   setDone: publicProcedure
    //     .input(
    //       z.object({
    //         id: z.number(),
    //         done: z.number(),
    //       })
    //     )
    //     .mutation(async (opts) => {
    //       await db
    //         .update(todos)
    //         .set({ done: opts.input.done })
    //         .where(eq(todos.id, opts.input.id))
    //         .run();
    //       return true;
    //     }),
});

export type AppRouter = typeof appRouter;
