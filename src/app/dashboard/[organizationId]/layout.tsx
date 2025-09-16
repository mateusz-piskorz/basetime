'use client';

import { NotFound } from '@/components/common/not-found';
import { SpinLoader } from '@/components/common/spin-loader';
import { AppLayout } from '@/layouts/dashboard/app-layout';
import { DayjsProvider } from '@/lib/hooks/use-dayjs';
import { MemberProvider } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { useParams } from 'next/navigation';

export default function OrganizationDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { organizationId } = useParams<{ organizationId: string }>();
    const { data, isError, isLoading } = trpc.organizations.useQuery({ organizationId });

    if (isError) {
        return <p className="text-red-500">Error getting organization</p>;
    }

    if (isLoading) {
        return (
            <div className="mt-[100px] flex w-full justify-center">
                <SpinLoader />
            </div>
        );
    }

    if (!data?.length) {
        return (
            <NotFound
                title="Organization not found"
                description="Ensure that the organization ID in the address bar matches an existing organization. You may also need to verify your permissions."
            />
        );
    }

    const { member, currency, id, roundUpMinutesThreshold, weekStart } = data[0];
    return (
        <MemberProvider member={member} currency={currency} organizationId={id} roundUpMinutesThreshold={roundUpMinutesThreshold}>
            <DayjsProvider weekStart={weekStart}>
                <AppLayout type="organization">{children}</AppLayout>
            </DayjsProvider>
        </MemberProvider>
    );
}
