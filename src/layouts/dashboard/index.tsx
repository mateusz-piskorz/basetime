import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { BreadcrumbItem } from './app-header/breadcrumbs';
import { AppSidebar } from './app-sidebar';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export const AppLayout = ({ children, breadcrumbs }: AppLayoutProps) => {
    return (
        <SidebarProvider open={true}>
            <AppSidebar />

            <SidebarInset>
                <AppHeader breadcrumbs={breadcrumbs} />
                <Separator />

                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};
