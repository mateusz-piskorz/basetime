'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
}

export function DataTableColumnHeader<TData, TValue>({ column, className }: DataTableColumnHeaderProps<TData, TValue>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const orderColumn = searchParams.get('order_column');
    const orderDirection = searchParams.get('order_direction');

    if (!column.getCanSort()) {
        return <div className={cn(className)}>{column.columnDef.meta?.title}</div>;
    }

    const handleSortChange = (option: 'asc' | 'desc') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('order_column', column.id);
        params.set('order_direction', option);

        router.replace(pathname + '?' + params.toString());
    };

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="data-[state=open]:bg-card hover:bg-card -ml-3 h-8">
                        <span>{column.columnDef.meta?.title}</span>
                        {orderColumn === column.id ? orderDirection === 'desc' ? <ArrowDown /> : <ArrowUp /> : <ChevronsUpDown />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleSortChange('asc')}>
                        <ArrowUp className="text-muted-foreground/70 h-3.5 w-3.5" />
                        Asc
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('desc')}>
                        <ArrowDown className="text-muted-foreground/70 h-3.5 w-3.5" />
                        Desc
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('order_column');
                            params.delete('order_direction');

                            column.toggleVisibility(false);
                            router.replace(pathname + '?' + params.toString());
                        }}
                    >
                        <EyeOff className="text-muted-foreground/70 h-3.5 w-3.5" />
                        Hide
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
