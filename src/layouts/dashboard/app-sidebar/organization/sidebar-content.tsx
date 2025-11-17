import {
    SidebarContent as SidebarContentUI,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useMember } from '@/lib/hooks/use-member';
import { ChartNoAxesColumnIncreasing, Clock, FolderClosed, KanbanSquareDashed, LayoutGrid, Settings, Users2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SidebarContent = () => {
    const { orgId, member } = useMember();
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    const items = [
        {
            title: 'Overview',
            href: `/dashboard/${orgId}/overview`,
            icon: LayoutGrid,
        },
        {
            title: 'Tasks',
            href: `/dashboard/${orgId}/kanban`,
            icon: KanbanSquareDashed,
        },
        {
            title: 'Reports',
            href: `/dashboard/${orgId}/reports`,
            icon: ChartNoAxesColumnIncreasing,
        },
    ];

    const manageItems = [
        {
            title: 'Projects',
            href: `/dashboard/${orgId}/projects`,
            icon: FolderClosed,
        },
        {
            title: 'Members',
            href: `/dashboard/${orgId}/members`,
            icon: Users2,
        },
        {
            title: 'Time',
            href: `/dashboard/${orgId}/time`,
            icon: Clock,
        },
        ...(member.role == 'OWNER'
            ? [
                  {
                      title: 'Settings',
                      href: `/dashboard/${orgId}/settings`,
                      icon: Settings,
                  },
              ]
            : []),
    ];

    return (
        <SidebarContentUI>
            <SidebarGroup className="py-0">
                <SidebarMenu>
                    {items.map((item) => {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton className="py-5" asChild isActive={item.href === pathname} tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch onClick={() => setOpenMobile(false)}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup className="mt-4 py-0">
                <SidebarGroupLabel>Manage</SidebarGroupLabel>
                <SidebarMenu>
                    {manageItems.map((item) => {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton className="py-5" asChild isActive={item.href === pathname} tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch onClick={() => setOpenMobile(false)}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContentUI>
    );
};
