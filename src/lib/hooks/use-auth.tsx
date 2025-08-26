'use client';

import { createContext, ReactNode, useContext } from 'react';

type AuthUser = {
    sessionId: string;
    name: string;
    id: string;
    email: string;
};

type AuthContextType = {
    user: AuthUser | null;
};

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider = ({ user, children }: { user: AuthUser; children: ReactNode }) => {
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context.user) {
        throw new Error('useCarousel must be used within a <Carousel />');
    }

    return { user: context.user };
};
