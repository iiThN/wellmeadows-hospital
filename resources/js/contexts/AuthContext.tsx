import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    staff_number?: string | null;
    [key: string]: unknown;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isLoggingOut: boolean;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set CSRF token from meta tag
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser]               = useState<AuthUser | null>(null);
    const [loading, setLoading]         = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const res = await axios.get('/api/user');
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email: string, password: string, remember = false) => {
        await axios.get('/sanctum/csrf-cookie');
        await axios.post('/login', { email, password, remember });
        await refresh();
    };

    const logout = async () => {
        try {
            setIsLoggingOut(true);
            await axios.post('/logout');
        } catch {
            // ignore errors, logout anyway
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isLoggingOut, login, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}