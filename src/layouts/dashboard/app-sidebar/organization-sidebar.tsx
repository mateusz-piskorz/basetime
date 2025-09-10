'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarSeparator } from '@/components/ui/sidebar';
import { useMember } from '@/lib/hooks/use-member';
import { ArrowLeftFromLineIcon, ChartNoAxesColumnIncreasing, Clock, FolderClosed, LayoutGrid, Settings, Users2 } from 'lucide-react';
import { NavItem, NavMain } from './nav-main';
import { NavOrganizations } from './nav-organizations';
import { NavUser } from './nav-user';

export function OrganizationSidebar() {
    const { member, organizationId } = useMember();

    const organizationNavItems: NavItem[] = [
        {
            title: 'Back',
            href: '/dashboard',
            icon: ArrowLeftFromLineIcon,
        },
        {
            title: 'Dashboard',
            href: `/dashboard/organization/${organizationId}`,
            icon: LayoutGrid,
        },
        {
            title: 'Time',
            href: `/dashboard/organization/${organizationId}/time`,
            icon: Clock,
        },
        {
            title: 'Reports',
            href: `/dashboard/organization/${organizationId}/reports`,
            icon: ChartNoAxesColumnIncreasing,
        },
        {
            title: 'Projects',
            href: `/dashboard/organization/${organizationId}/projects`,
            icon: FolderClosed,
        },
        {
            title: 'Members',
            href: `/dashboard/organization/${organizationId}/members`,
            icon: Users2,
        },
        ...(member.role == 'OWNER'
            ? [
                  {
                      title: 'Settings',
                      href: `/dashboard/organization/${organizationId}/settings`,
                      icon: Settings,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <NavOrganizations organizationId={organizationId} />
            </SidebarHeader>

            <SidebarSeparator className="mx-0 mb-2" />

            <SidebarContent>
                <NavMain items={organizationNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
