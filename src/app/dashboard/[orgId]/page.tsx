import { permanentRedirect } from 'next/navigation';

type Props = { params: Awaited<{ organizationId: string }> };

export default async function OrganizationPage({ params }: Props) {
    const { organizationId } = await params;

    permanentRedirect(`/dashboard/${organizationId}/overview`);
}
