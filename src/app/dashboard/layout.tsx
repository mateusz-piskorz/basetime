import { AuthProvider } from '@/lib/hooks/use-auth';
import { getUserAvatarUrl } from '@/lib/minio';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getSession();
    if (!user) return redirect('/login');
    const avatar = user ? await getUserAvatarUrl({ userId: user?.userId }) : undefined;

    return <AuthProvider user={{ ...user, avatar }}>{children}</AuthProvider>;
}
