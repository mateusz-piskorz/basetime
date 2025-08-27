import { AppLayout } from '@/layouts/dashboard';

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AppLayout>{children}</AppLayout>;
}
