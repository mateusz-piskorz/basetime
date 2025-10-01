import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import { redirect } from 'next/navigation';

const queryClient = getQueryClient();
export default async function DashboardPage() {
    const [organization] = await queryClient.fetchQuery(trpc.organizations.queryOptions({ limit: 1 }));
    console.log({ organization });
    if (organization) return redirect(`/dashboard/${organization.id}/overview`);

    return redirect('/dashboard/user/organizations');
}
