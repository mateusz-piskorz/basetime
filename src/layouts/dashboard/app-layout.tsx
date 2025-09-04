import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { BreadcrumbItem } from './app-header/breadcrumbs';
import { OrganizationSidebar, UserSidebar } from './app-sidebar';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    type: 'organization' | 'user';
}

export const AppLayout = ({ children, breadcrumbs, type }: AppLayoutProps) => {
    return (
        <SidebarProvider open={true}>
            {type === 'organization' ? <OrganizationSidebar /> : <UserSidebar />}

            <SidebarInset>
                <AppHeader breadcrumbs={breadcrumbs} />
                <Separator />

                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};
