import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarFooter as SidebarFooterUI, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { useMember } from '@/lib/hooks/use-member';
import { logout } from '@/lib/server-actions/auth';
import { LogOut, Send, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const SidebarFooter = () => {
    const { organizationId } = useMember();
    const { state, setOpenMobile } = useSidebar();
    const isMobile = useIsMobile();

    const router = useRouter();

    const handleLogout = async () => {
        const res = await logout({});
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Logged out successfully');
        router.replace('/');
    };

    return (
        <SidebarFooterUI>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">
                                <UserInfo />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="end"
                            side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <UserInfo showEmail={true} />
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                                <Link
                                    className="block w-full py-2.5"
                                    href={`/dashboard/${organizationId}/user-invitations`}
                                    prefetch
                                    onClick={() => setOpenMobile(false)}
                                >
                                    <Send className="mr-2" />
                                    Invitations
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link
                                    className="block w-full py-2.5"
                                    href={`/dashboard/${organizationId}/user-settings`}
                                    prefetch
                                    onClick={() => setOpenMobile(false)}
                                >
                                    <Settings className="mr-2" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Button onClick={handleLogout} variant="link" className="w-full justify-start">
                                    <LogOut className="mr-2" />
                                    Log out
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooterUI>
    );
};
