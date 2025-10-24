import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { AppRouter } from './index';

export const trpc = createTRPCReact<AppRouter>();
export type TrpcRouterOutput = inferRouterOutputs<AppRouter>;
export type TrpcRouterInput = inferRouterInputs<AppRouter>;
