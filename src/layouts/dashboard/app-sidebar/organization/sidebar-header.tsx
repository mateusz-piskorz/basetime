/* eslint-disable @next/next/no-img-element */

import { CreateOrganizationDialog } from '@/components/common/create-organization-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarHeader as SidebarHeaderUI, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { cn, getInitials } from '@/lib/utils/common';

import { ChevronsUpDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const SidebarHeader = () => {
    const [open, setOpen] = useState(false);
    const { logo, organizationName } = useMember();
    const { setOpenMobile } = useSidebar();
    const { data } = trpc.organizations.useQuery({});

    return (
        <>
            <CreateOrganizationDialog open={open} setOpen={setOpen} />
            <SidebarHeaderUI>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">
                                    <OrgInfo name={organizationName} logo={logo} />
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-[362px] w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" align="end">
                                {data?.map((org) => (
                                    <DropdownMenuItem key={org.id} asChild>
                                        <Link
                                            className="flex w-full items-center gap-2 py-2"
                                            href={`/dashboard/${org.id}/user-invitations`}
                                            prefetch
                                            onClick={() => setOpenMobile(false)}
                                        >
                                            <OrgInfo name={org.name} logo={org.logo} />
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setOpen(true)} className="py-2">
                                    Create
                                    <Plus />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeaderUI>
        </>
    );
};

type Props = {
    name: string;
    logo?: string;
};

const OrgInfo = ({ name, logo }: Props) => {
    return (
        <>
            <Avatar className={cn('h-8 w-8 overflow-hidden rounded-xs')}>
                <AvatarImage src={logo} alt="logo" />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
            </div>
        </>
    );
};
