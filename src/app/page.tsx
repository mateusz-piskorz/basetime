import { getAllUsers } from '@/actions/example';
import { getQueryClient } from '@/lib/tanstackQuery/queryClient';
import {MyFrontendComponent} from '@/MyFrontendComponent'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Home() {
    const queryClient = getQueryClient()

    await queryClient.prefetchQuery({queryKey:['getAllUsers'],queryFn:getAllUsers})
  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MyFrontendComponent />
      </HydrationBoundary>
    </div>
  );
}
