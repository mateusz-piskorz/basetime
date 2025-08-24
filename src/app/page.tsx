import {MyFrontendComponent} from '@/MyFrontendComponent'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import {getQueryClient,trpc} from '@/lib/trpc/server-client'

export default async function Home() {
 const queryClient = getQueryClient();
 
  await queryClient.prefetchQuery(
    trpc.getUsers.queryOptions(),
  );
  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MyFrontendComponent />
      </HydrationBoundary>
    </div>
  );
}
