'use client';

import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeftFromLineIcon } from 'lucide-react';

type Props = {
    organizationId: string;
};

export const NavOrganizations = ({ organizationId }: Props) => {
    const { setOpenMobile } = useSidebar();

    const { data } = trpc.getUserOrganizations.useQuery();

    const selectedOrganization = data?.find((e) => e.id === organizationId);

    return (
        // TODO: it might be select instead of dropdown
        <SidebarMenu>
            <SidebarMenuItem>
                <ArrowLeftFromLineIcon />
                <span>Back</span>
                {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">
                            <p className="line-clamp-1">{selectedOrganization?.name}</p>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded" align="end" side="top">
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">Select Organization</div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {data?.map(({ id, name }) => {
                            return (
                                <DropdownMenuItem key={id} asChild>
                                    <Link
                                        className="flex items-center justify-between"
                                        href={`/dashboard/${id}`}
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        <p className="line-clamp-1">{name}</p>
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu> */}
            </SidebarMenuItem>
        </SidebarMenu>
    );
};
