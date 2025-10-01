'use client';

import { Sidebar, SidebarSeparator } from '@/components/ui/sidebar';
import { SidebarContent } from './sidebar-content';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';

export const UserSidebar = () => {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader />
            <SidebarSeparator className="mx-0 mb-2" />
            <SidebarContent />
            <SidebarFooter />
        </Sidebar>
    );
};
