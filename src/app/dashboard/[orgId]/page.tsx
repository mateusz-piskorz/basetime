import { permanentRedirect } from 'next/navigation';

type Props = { params: Promise<{ orgId: string }> };

export default async function OrganizationPage({ params }: Props) {
    const { orgId } = await params;

    permanentRedirect(`/dashboard/${orgId}/overview`);
}
