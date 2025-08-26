// import { getQueryClient, trpc } from '@/lib/trpc/server-client';
// import { MyFrontendComponent } from '@/MyFrontendComponent';
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Home() {
    // const queryClient = getQueryClient();

    // await queryClient.prefetchQuery(trpc.getUsers.queryOptions());
    return (
        <div>
            home
            {/* <HydrationBoundary state={dehydrate(queryClient)}>
                <MyFrontendComponent />
            </HydrationBoundary> */}
        </div>
    );
}
