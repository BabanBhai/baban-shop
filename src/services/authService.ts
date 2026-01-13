import { supabase, isSupabaseConfigured, ADMIN_EMAIL } from '../config/supabase.config';
import { User } from '../types';

export const authService = {
    // Register with email and password
    async register(email: string, password: string, displayName: string): Promise<User> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured. Please add credentials to .env.local');
        }

        try {
            // Sign up the user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                    },
                },
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error('Failed to create user');

            // Create user profile in public.users table
            const role = email === ADMIN_EMAIL ? 'admin' : 'user';
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: authData.user.email!,
                    display_name: displayName,
                    role,
                });

            if (profileError) {
                console.error('Error creating user profile:', profileError);
            }

            return {
                id: authData.user.id,
                email: authData.user.email!,
                displayName,
                role,
            };
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Failed to register');
        }
    },

    // Login with email and password
    async login(email: string, password: string): Promise<User> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured. Please add credentials to .env.local');
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            if (!data.user) throw new Error('Login failed');

            return await this.getCurrentUserData(data.user.id);
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Failed to login');
        }
    },

    // Login with Google OAuth
    async loginWithGoogle(): Promise<User> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured. Please add credentials to .env.local');
        }

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                },
            });

            if (error) throw error;

            // Note: OAuth will redirect, so we can't return user data immediately
            // The user data will be available after redirect via onAuthStateChange
            throw new Error('Redirecting to Google...');
        } catch (error: any) {
            console.error('Google login error:', error);
            throw error;
        }
    },

    // Logout
    async logout(): Promise<void> {
        if (!isSupabaseConfigured || !supabase) {
            return;
        }

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error('Failed to logout');
        }
    },

    // Reset password
    async resetPassword(email: string): Promise<void> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured. Please add credentials to .env.local');
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Password reset error:', error);
            throw new Error(error.message || 'Failed to send password reset email');
        }
    },

    // Get current user data
    async getCurrentUserData(userId: string): Promise<User> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // If user doesn't exist in users table, create it
                const { data: authUser } = await supabase.auth.getUser();
                if (authUser.user) {
                    const role = authUser.user.email === ADMIN_EMAIL ? 'admin' : 'user';
                    const newUser = {
                        id: authUser.user.id,
                        email: authUser.user.email!,
                        display_name: authUser.user.user_metadata?.display_name || authUser.user.email!.split('@')[0],
                        role,
                    };

                    await supabase.from('users').insert(newUser);

                    return {
                        id: newUser.id,
                        email: newUser.email,
                        displayName: newUser.display_name,
                        role: newUser.role,
                    };
                }
                throw error;
            }

            return {
                id: data.id,
                email: data.email,
                displayName: data.display_name,
                role: data.role,
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw new Error('Failed to fetch user data');
        }
    },

    // Check if user is admin
    isAdmin(user: User | null): boolean {
        return user?.role === 'admin';
    },
};
