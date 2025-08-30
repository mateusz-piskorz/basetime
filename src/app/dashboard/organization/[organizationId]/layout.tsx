'use client';

import { SpinLoader } from '@/components/common/spin-loader';
import { trpc } from '@/lib/trpc/client';
import { Rabbit } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function OrganizationLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { organizationId } = useParams<{ organizationId: string }>();
    const { data, error, isLoading } = trpc.getOrganization.useQuery({ organizationId });

    if (error) {
        return <p className="text-red-500">{error.message}</p>;
    }

    if (isLoading) {
        return <SpinLoader />;
    }

    if (!data) {
        return (
            <div className="mx-auto mt-20 space-y-4 text-center">
                <Rabbit size={90} className="mx-auto" />
                <h1 className="text-2xl">Organization not found</h1>
                <p className="text-muted-foreground max-w-[500px]">
                    Ensure that the organization ID in the address bar matches an existing organization. You may also need to verify your permissions.
                </p>
            </div>
        );
    }

    return children;
}
