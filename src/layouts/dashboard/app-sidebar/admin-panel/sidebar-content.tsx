import {
    SidebarContent as SidebarContentUI,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Book, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
    {
        title: 'Go Back',
        href: '/dashboard/user',
        icon: User,
    },
    {
        title: 'Blog',
        href: '/dashboard/admin-panel/blog',
        icon: Book,
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
