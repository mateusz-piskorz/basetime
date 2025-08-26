'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 1024;

export function useIsMobile(breakpoint_arg?: number) {
    const [isMobile, setIsMobile] = useState<boolean>();
    const breakpoint = breakpoint_arg || MOBILE_BREAKPOINT;

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        const onChange = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        mql.addEventListener('change', onChange);
        setIsMobile(window.innerWidth < breakpoint);

        return () => mql.removeEventListener('change', onChange);
    }, []);

    return !!isMobile;
}
