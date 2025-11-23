'use client';
import React from 'react';

import { SortingState } from '@tanstack/react-table';

export const useTableSorting = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    return { order_column: sorting?.[0]?.id, order_direction: sorting?.[0]?.desc ? 'desc' : 'asc', sortingProp: { sorting, setSorting } };
};
