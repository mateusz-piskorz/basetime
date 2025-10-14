'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils/common';
import { flexRender, Table as TableType } from '@tanstack/react-table';
import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<TData> {
    totalPages?: number;
    className?: string;
    table: TableType<TData>;
    toolbar?: React.ReactNode;
}

export function DataTable<TData>({ totalPages, className, table, toolbar }: DataTableProps<TData>) {
    return (
        <Card className={className}>
            <CardContent className="flex flex-col gap-4">
                {toolbar}
                <div className="rounded border">
                    <Table>
                        <TableHeader className="bg-border">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead
                                                className={cn(headerGroup.headers[0].id === header.id ? 'pl-6' : '')}
                                                key={header.id}
                                                colSpan={header.colSpan}
                                            >
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(
                                                    cell.getContext().row.getVisibleCells()[0].id === cell.id
                                                        ? 'pl-6'
                                                        : cell.getContext().row.getVisibleCells().slice(-1)[0].id === cell.id
                                                          ? 'pr-6'
                                                          : '',
                                                )}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination table={table} totalPages={totalPages ?? 1} />
            </CardContent>
        </Card>
    );
}
