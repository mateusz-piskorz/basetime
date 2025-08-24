'use client'

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {  makeQueryClient } from "./queryClient";
import { ReactNode, useState } from "react";
import { trpc } from "../trpc/client";
import { httpBatchLink } from '@trpc/client';


let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    if (process.env.NEXT_PUBLIC_URL)
      return `https://${process.env.NEXT_PUBLIC_URL}`;
    return 'http://localhost:3000';
  })();
  return `${base}/api/trpc`;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getUrl(),
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
}