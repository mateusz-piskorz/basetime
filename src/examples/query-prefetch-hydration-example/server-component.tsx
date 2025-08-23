import { getAllUsers } from '@/actions/example';
import { getQueryClient } from '@/lib/tanstackQuery/queryClient';
import {MyFrontendComponent} from '@/MyFrontendComponent'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export async function ServerComponent() {
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
