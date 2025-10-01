import { AppLogo } from '@/components/common/app-logo';
import { SidebarHeader as SidebarHeaderUI, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';

export const SidebarHeader = () => {
    const { setOpenMobile } = useSidebar();
    return (
        <SidebarHeaderUI>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                        <Link href="/dashboard/user/organizations" prefetch onClick={() => setOpenMobile(false)}>
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeaderUI>
    );
};
