'use client';

import { SpinLoader } from '@/components/common/spin-loader';
import { trpc } from '@/lib/trpc/client';
import { useParams } from 'next/navigation';

export const MainSection = () => {
    const { organizationId } = useParams<{ organizationId: string }>();

    const { data, isLoading, error } = trpc.getOrganization.useQuery({ organizationId });

    return (
        <div>
            {error && <p className="text-red-500">Error loading organization data: {error.message}</p>}
            {!error && isLoading && <SpinLoader />}
            {!error && !isLoading && data && <p>OrganizationPage {data.name}</p>}
        </div>
    );
};
