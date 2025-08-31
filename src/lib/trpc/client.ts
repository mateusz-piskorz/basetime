import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from './index';

export const trpc = createTRPCReact<AppRouter>();
export type TrpcRouterOutput = inferRouterOutputs<AppRouter>;
