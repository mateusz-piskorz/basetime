'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMember } from '@/lib/hooks/use-member';
import { ClipboardCheck, KanbanSquareDashed, PlusCircle } from 'lucide-react';

type Props = {
    onTaskClick: () => void;
    onStatusClick: () => void;
};

export const ActionButton = ({ onStatusClick, onTaskClick }: Props) => {
    const { member } = useMember();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="accent">
                    <PlusCircle />
                    Create
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-lg" align="end">
                <DropdownMenuItem className="gap-3 font-mono text-lg" onClick={onTaskClick}>
                    <ClipboardCheck className="size-5" /> Task
                </DropdownMenuItem>
                {['MANAGER', 'OWNER'].includes(member.role) && (
                    <DropdownMenuItem className="gap-3 font-mono text-lg" onClick={onStatusClick}>
                        <KanbanSquareDashed className="size-5" />
                        Status
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
