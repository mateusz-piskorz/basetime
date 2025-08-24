import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import 'server-only';
import { appRouter } from './index';
import { createTRPCContext } from './init';
import { makeQueryClient } from './queryClient';

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
    ctx: createTRPCContext,
    router: appRouter,
    queryClient: getQueryClient,
});
