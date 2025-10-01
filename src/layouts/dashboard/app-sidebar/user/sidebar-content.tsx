import {
    SidebarContent as SidebarContentUI,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { BriefcaseBusiness, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
    {
        title: 'Organizations',
        href: '/dashboard/user/organizations',
        icon: BriefcaseBusiness,
    },
    {
        title: 'Invitations',
        href: '/dashboard/user/invitations',
        icon: Send,
    },
];

export const SidebarContent = () => {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

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
