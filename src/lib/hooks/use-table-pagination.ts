'use client';

import { useSearchParams } from 'next/navigation';

export const useTablePagination = () => {
    const searchParams = useSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    return { page: page ? Number(page) : null, limit: limit ? Number(limit) : 25 };
};
