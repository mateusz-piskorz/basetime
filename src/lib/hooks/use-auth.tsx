'use client';

import { createContext, ReactNode, useContext } from 'react';

type AuthUser = {
    sessionId: string;
    name: string;
    userId: string;
    email: string;
    avatar: string | undefined;
};

type AuthContextType = {
    user: AuthUser | null;
};

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider = ({ user, children }: { user: AuthUser | null; children: ReactNode }) => {
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within a <AuthProvider />');
    }

    return context;
};
