import {
    SidebarContent as SidebarContentUI,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useMember } from '@/lib/hooks/use-member';
import { ChartNoAxesColumnIncreasing, Clock, FolderClosed, LayoutGrid, Settings, Users2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SidebarContent = () => {
    const { organizationId, member } = useMember();
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    const items = [
        {
            title: 'Overview',
            href: `/dashboard/${organizationId}/overview`,
            icon: LayoutGrid,
        },
        {
            title: 'Time',
            href: `/dashboard/${organizationId}/time`,
            icon: Clock,
        },
        {
            title: 'Reports',
            href: `/dashboard/${organizationId}/reports`,
            icon: ChartNoAxesColumnIncreasing,
        },
        {
            title: 'Projects',
            href: `/dashboard/${organizationId}/projects`,
            icon: FolderClosed,
        },
        {
            title: 'Members',
            href: `/dashboard/${organizationId}/members`,
            icon: Users2,
        },
        ...(member.role == 'OWNER'
            ? [
                  {
                      title: 'Settings',
                      href: `/dashboard/${organizationId}/settings`,
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
        </SidebarContentUI>
    );
};
