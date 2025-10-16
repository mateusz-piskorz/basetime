import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { AdminPanelSidebar } from './app-sidebar/admin-panel';
import { OrganizationSidebar } from './app-sidebar/organization';
import { UserSidebar } from './app-sidebar/user';

interface AppLayoutProps {
    children: ReactNode;
    type: 'organization' | 'user' | 'admin-panel';
}

export const AppLayout = ({ children, type }: AppLayoutProps) => {
    return (
        <SidebarProvider open={true}>
            {type === 'organization' ? <OrganizationSidebar /> : type === 'admin-panel' ? <AdminPanelSidebar /> : <UserSidebar />}

            <SidebarInset>
                <AppHeader />

                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};
