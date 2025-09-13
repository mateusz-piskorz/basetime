/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { debounce } from 'lodash';
import { Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ComponentProps } from 'react';
import { MultiOptionsFilter } from '../multi-options-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    addNewRecord?:
        | {
              label: string;
              action: () => void;
          }
        | {
              label: string;
              href: string;
          };
    filters: ComponentProps<typeof MultiOptionsFilter>[];
    displaySearchBar?: boolean;
    onSelectedRemove?: (selectedIds: string[]) => void;
}

export function DataTableToolbar<TData>({ table, addNewRecord, filters, displaySearchBar = true, onSelectedRemove }: DataTableToolbarProps<TData>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const q = searchParams.get('q');

    const setQParam = (value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('q', value);
        } else {
            params.delete('q');
        }
        router.replace(pathname + '?' + params.toString());
    };

    const filterKeys = filters.map((e) => e.filterKey);

    const resetFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        filterKeys.forEach((key) => {
            params.delete(key);
        });
        router.replace(pathname + '?' + params.toString());
    };

    const selected = table.getFilteredSelectedRowModel().rows;

    return (
        <div className="flex flex-col items-center justify-between gap-4 overflow-x-auto pt-1 pr-1 pb-4 md:flex-row">
            {displaySearchBar && (
                <Input
                    placeholder="Search"
                    onChange={debounce((event) => setQParam(event.target.value), 500)}
                    defaultValue={q || ''}
                    className="min-w-[150px] rounded md:max-w-xs"
                />
            )}
            {selected.length > 0 && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <p>{selected.length} selected</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onSelectedRemove?.(selected.map((e) => (e.original as any).id));
                        }}
                    >
                        <Trash2 color="red" />
                    </Button>
                </div>
            )}
            <div className="mr-auto flex items-center gap-2">
                {filters.map((e) => (
                    <MultiOptionsFilter key={e.filterKey} title={e.title} options={e.options} filterKey={e.filterKey} />
                ))}

                {searchParams.keys().some((e) => filterKeys.includes(e)) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        Reset
                        <X />
                    </Button>
                )}
            </div>

            <div className="flex w-full items-center gap-4 md:w-auto">
                <DataTableViewOptions table={table} />
                {addNewRecord && (
                    <>
                        {'href' in addNewRecord ? (
                            <Link prefetch className="ml-2 whitespace-nowrap underline-offset-4 hover:underline" href={addNewRecord.href}>
                                {addNewRecord.label}
                            </Link>
                        ) : (
                            <Button onClick={addNewRecord.action}>{addNewRecord.label}</Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
