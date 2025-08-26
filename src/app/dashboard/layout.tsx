import { AppLayout } from '@/layouts/dashboard';
import { AuthProvider } from '@/lib/hooks/use-auth';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return (
        <AuthProvider user={user}>
            <AppLayout>{children}</AppLayout>
        </AuthProvider>
    );
}
