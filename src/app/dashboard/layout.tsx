import { AuthProvider } from '@/lib/hooks/use-auth';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getSession();
    if (!user) return redirect('/login');

    return <AuthProvider user={{ ...user }}>{children}</AuthProvider>;
}
