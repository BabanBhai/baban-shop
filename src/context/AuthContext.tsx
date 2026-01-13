import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase.config';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, displayName: string) => Promise<User>;
    loginWithGoogle: () => Promise<User>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // If Supabase is not configured, immediately set loading to false
        if (!isSupabaseConfigured || !supabase) {
            console.warn('🔥 DEMO MODE: Supabase not configured. Authentication features disabled.');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                authService.getCurrentUserData(session.user.id)
                    .then(userData => {
                        setCurrentUser(userData);
                        setIsAdmin(authService.isAdmin(userData));
                    })
                    .catch(error => {
                        console.error('Error loading user data:', error);
                    })
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                try {
                    const userData = await authService.getCurrentUserData(session.user.id);
                    setCurrentUser(userData);
                    setIsAdmin(authService.isAdmin(userData));
                } catch (error) {
                    console.error('Error loading user data:', error);
                    setCurrentUser(null);
                    setIsAdmin(false);
                }
            } else {
                setCurrentUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        const user = await authService.login(email, password);
        setCurrentUser(user);
        setIsAdmin(authService.isAdmin(user));
        return user;
    };

    const register = async (email: string, password: string, displayName: string) => {
        const user = await authService.register(email, password, displayName);
        setCurrentUser(user);
        setIsAdmin(authService.isAdmin(user));
        return user;
    };

    const loginWithGoogle = async () => {
        const user = await authService.loginWithGoogle();
        setCurrentUser(user);
        setIsAdmin(authService.isAdmin(user));
        return user;
    };

    const logout = async () => {
        await authService.logout();
        setCurrentUser(null);
        setIsAdmin(false);
    };

    const resetPassword = async (email: string) => {
        await authService.resetPassword(email);
    };

    const value: AuthContextType = {
        currentUser,
        loading,
        isAdmin,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
