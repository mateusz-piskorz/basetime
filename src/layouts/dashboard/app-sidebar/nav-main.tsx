'use client';

import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; title: string; icon?: LucideIcon };

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    return (
        <SidebarGroup className="px-2 py-0">
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu>
                {items.map((item) => {
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.href === pathname} tooltip={{ children: item.title }}>
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
    );
}
