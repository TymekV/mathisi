import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getAuthToken, setAuthToken, subscribeToTokenChanges } from '@/lib/auth/token';

interface AuthContextValue {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const storedToken = await getAuthToken();
            setToken(storedToken);
            setIsLoading(false);
        })();
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToTokenChanges(setToken);
        return unsubscribe;
    }, []);

    const signIn = useCallback(async (nextToken: string) => {
        await setAuthToken(nextToken);
    }, []);

    const signOut = useCallback(async () => {
        await setAuthToken(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            isAuthenticated: Boolean(token),
            isLoading,
            signIn,
            signOut,
        }),
        [isLoading, signIn, signOut, token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
