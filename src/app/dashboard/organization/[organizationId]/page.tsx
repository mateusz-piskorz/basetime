import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { MainSection } from './_partials/main-section';

export default async function OrganizationPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return <MainSection />;
}
