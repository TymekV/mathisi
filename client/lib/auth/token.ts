import * as SecureStore from 'expo-secure-store';

let tokenCache: string | null | undefined;
const listeners = new Set<(token: string | null) => void>();

export async function getAuthToken(): Promise<string | null> {
    if (tokenCache !== undefined) {
        return tokenCache;
    }

    try {
        tokenCache = (await SecureStore.getItemAsync('token')) ?? null;
    } catch (error) {
        console.warn('Failed to load auth token from SecureStore', error);
        tokenCache = null;
    }

    return tokenCache;
}

export async function setAuthToken(token: string | null): Promise<void> {
    tokenCache = token;

    try {
        if (token) {
            await SecureStore.setItemAsync('token', token);
        } else {
            await SecureStore.deleteItemAsync('token');
        }
    } catch (error) {
        console.warn('Failed to persist auth token', error);
    }

    listeners.forEach((listener) => {
        try {
            listener(token);
        } catch (error) {
            console.warn('Auth token listener failed', error);
        }
    });
}

export function subscribeToTokenChanges(listener: (token: string | null) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
