'use client';

import { USER_ROLE } from '@prisma/client';
import { createContext, ReactNode, useContext } from 'react';

type AuthUser = {
    sessionId: string;
    name: string;
    userId: string;
    email: string;
    avatar?: string;
    role: USER_ROLE;
};

type AuthContextType = {
    user: AuthUser;
} | null;

const AuthContext = createContext<AuthContextType>(null);

export const AuthProvider = ({ user, children }: { user: AuthUser; children: ReactNode }) => {
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within a <AuthProvider />');
    }

    return context;
};
