ideas:

- change website title like on https://pomofocus.io/ '09:47 - Time for a break!'
- auth refresh token, client can send request to refresh at end of token expiration, we can have that information from cookie

example of trpc in server component:
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
const queryClient = getQueryClient();
const res = await queryClient.fetchQuery(
trpc.getOrganization.queryOptions({
organizationId,
}),
);
