ideas:

- change website title like on https://pomofocus.io/ '09:47 - Time for a break!'
- update to 15.5 https://nextjs.org/blog/next-15-5

example of trpc in server component:
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
const queryClient = getQueryClient();
const res = await queryClient.fetchQuery(
trpc.getOrganization.queryOptions({
organizationId,
}),
);
