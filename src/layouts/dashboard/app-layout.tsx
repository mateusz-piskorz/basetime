import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { OrganizationSidebar } from './app-sidebar/organization';
import { UserSidebar } from './app-sidebar/user';

interface AppLayoutProps {
    children: ReactNode;
    type: 'organization' | 'user';
}

export const AppLayout = ({ children, type }: AppLayoutProps) => {
    return (
        <SidebarProvider open={true}>
            {type === 'organization' ? <OrganizationSidebar /> : <UserSidebar />}

            <SidebarInset>
                <AppHeader />

                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};
