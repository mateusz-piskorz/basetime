/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
    ColumnDef,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    OnChangeFn,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { useState } from 'react';

type Props<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data?: TData[];
    sorting?: SortingState;
    setSorting?: OnChangeFn<SortingState>;
};

const emptyArr: any[] = [];

export const useTable = <TData, TValue>({ columns, data, setSorting, sorting }: Props<TData, TValue>) => {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const table = useReactTable({
        data: data || emptyArr,
        columns,
        state: { columnVisibility, sorting },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualSorting: true,
    });

    return { table, sorting };
};
