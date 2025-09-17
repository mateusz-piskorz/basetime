'use client';

import { SortingState } from '@tanstack/react-table';
import { useState } from 'react';

export const useTableSorting = () => {
    const [sorting, setSorting] = useState<SortingState>([]);

    return { order_column: sorting?.[0]?.id, order_direction: sorting?.[0]?.desc ? 'desc' : 'asc', sortingProp: { sorting, setSorting } };
};
