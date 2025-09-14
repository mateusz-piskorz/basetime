'use client';

import { createDayjs } from '@/lib/dayjs';
import { WEEK_START } from '@prisma/client';

import { createContext, ReactNode, useContext } from 'react';

type DayjsContextType = {
    dayjs: typeof import('dayjs');
} | null;

const DayjsContext = createContext<DayjsContextType>(null);

export const DayjsProvider = ({ weekStart, children }: { weekStart: WEEK_START; children: ReactNode }) => {
    const dayjs = createDayjs(weekStart);
    return <DayjsContext.Provider value={{ dayjs }}>{children}</DayjsContext.Provider>;
};

export const useDayjs = () => {
    const context = useContext(DayjsContext);

    if (!context) {
        throw new Error('useDayjs must be used within a <DayjsProvider />');
    }

    return context;
};
