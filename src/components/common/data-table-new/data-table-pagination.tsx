'use client';

import { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    totalPages: number;
}

export function DataTablePagination<TData>({ table, totalPages }: DataTablePaginationProps<TData>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const limit = searchParams.get('limit');
    const page = searchParams.get('page') ?? 1;

    const handlePageChange = (action: 'prev' | 'next') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(Number(page) + (action === 'next' ? 1 : -1)));

        router.replace(pathname + '?' + params.toString());
    };

    return (
        <div className="mt-2 flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
            <div className="flex justify-between gap-4 sm:gap-0">
                <div className="flex items-center space-x-2">
                    <p className="hidden text-sm font-medium sm:inline-block">Rows per page</p>
                    <Select
                        value={limit ? String(limit) : '25'}
                        onValueChange={(value) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('limit', value);
                            router.replace(pathname + '?' + params.toString());
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px] rounded">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={String(pageSize)}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex">
                    <div className="hidden w-[100px] items-center justify-center text-sm font-medium sm:flex">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden size-8 md:flex"
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('page', '1');

                                router.replace(pathname + '?' + params.toString());
                            }}
                            disabled={page === 1}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft />
                        </Button>
                        <Button variant="outline" size="icon" className="size-8" onClick={() => handlePageChange('prev')} disabled={page === 1}>
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft />
                        </Button>
                        <span className="sm:hidden">
                            {page} of {table.getPageCount()}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => handlePageChange('next')}
                            disabled={page === totalPages}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden size-8 md:flex"
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('page', String(totalPages));
                                router.replace(pathname + '?' + params.toString());
                            }}
                            disabled={page === totalPages}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
