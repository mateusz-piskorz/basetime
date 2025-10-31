import { UserSettings } from '@/components/pages/user-settings';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function UserSettingsPage() {
    const user = await getSession();
    if (!user) return redirect('/');

    return <UserSettings />;
}
