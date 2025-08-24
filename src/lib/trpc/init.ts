import { initTRPC } from '@trpc/server';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const {createCallerFactory} = t;
export const publicProcedure = t.procedure;