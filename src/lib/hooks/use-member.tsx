'use client';

import { CURRENCY, MEMBER_ROLE } from '@prisma/client';
import { createContext, ReactNode, useContext } from 'react';

type Member = {
    id: string;
    userId: string;
    role: MEMBER_ROLE;
};

type MemberContextType = {
    orgId: string;
    orgName: string;
    currency: CURRENCY;
    roundUpMinutesThreshold: number;
    member: Member;
    orgLogo?: string;
} | null;

const MemberContext = createContext<MemberContextType>(null);

export const MemberProvider = ({
    member,
    currency,
    orgId,
    children,
    roundUpMinutesThreshold,
    orgLogo,
    orgName,
}: {
    orgName: string;
    member: Member;
    currency: CURRENCY;
    orgId: string;
    roundUpMinutesThreshold: number;
    children: ReactNode;
    orgLogo?: string;
}) => {
    return <MemberContext.Provider value={{ member, currency, orgId, roundUpMinutesThreshold, orgLogo, orgName }}>{children}</MemberContext.Provider>;
};

export const useMember = () => {
    const context = useContext(MemberContext);

    if (!context) {
        throw new Error('useMember must be used within a <MemberProvider />');
    }

    return context;
};
