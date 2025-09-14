'use client';

import { CURRENCY, MEMBER_ROLE } from '@prisma/client';
import { createContext, ReactNode, useContext } from 'react';

type Member = {
    id: string;
    userId: string;
    role: MEMBER_ROLE;
};

type MemberContextType = {
    organizationId: string;
    currency: CURRENCY;
    roundUpMinutesThreshold: number;
    member: Member;
} | null;

const MemberContext = createContext<MemberContextType>(null);

export const MemberProvider = ({
    member,
    currency,
    organizationId,
    children,
    roundUpMinutesThreshold,
}: {
    member: Member;
    currency: CURRENCY;
    organizationId: string;
    roundUpMinutesThreshold: number;
    children: ReactNode;
}) => {
    return <MemberContext.Provider value={{ member, currency, organizationId, roundUpMinutesThreshold }}>{children}</MemberContext.Provider>;
};

export const useMember = () => {
    const context = useContext(MemberContext);

    if (!context) {
        throw new Error('useMember must be used within a <MemberProvider />');
    }

    return context;
};
