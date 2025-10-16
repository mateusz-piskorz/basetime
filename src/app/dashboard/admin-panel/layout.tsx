import { AppLayout } from '@/layouts/dashboard/app-layout';

export default function UserDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AppLayout type="admin-panel">{children}</AppLayout>;
}
