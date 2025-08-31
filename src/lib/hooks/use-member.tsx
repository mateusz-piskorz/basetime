'use client';

import { MEMBER_ROLE } from '@prisma/client';
import { createContext, ReactNode, useContext } from 'react';

type Member = {
    organizationId: string;
    id: string;
    userId: string;
    role: MEMBER_ROLE;
};

type MemberContextType = {
    member: Member | null;
};

const MemberContext = createContext<MemberContextType>({ member: null });

export const MemberProvider = ({ member, children }: { member: Member; children: ReactNode }) => {
    return <MemberContext.Provider value={{ member }}>{children}</MemberContext.Provider>;
};

export const useMember = () => {
    const context = useContext(MemberContext);

    if (!context.member) {
        throw new Error('useMember must be used within a <MemberProvider />');
    }

    return { member: context.member };
};
