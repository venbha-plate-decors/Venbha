import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        const checkSessionTimeout = async () => {
            const loginTime = localStorage.getItem('auth_login_time');
            if (loginTime) {
                const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
                const currentTime = new Date().getTime();

                if (currentTime - parseInt(loginTime) > twoDaysInMs) {
                    await signOut();
                }
            }
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            if (session) checkSessionTimeout();
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                const existingTime = localStorage.getItem('auth_login_time');
                if (!existingTime) {
                    localStorage.setItem('auth_login_time', new Date().getTime().toString());
                }
            }
            if (event === 'SIGNED_OUT') {
                localStorage.removeItem('auth_login_time');
            }

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (session) checkSessionTimeout();
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        // Clear any old timestamps before new login
        localStorage.removeItem('auth_login_time');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (data.session) {
            localStorage.setItem('auth_login_time', new Date().getTime().toString());
        }

        return { data, error };
    };

    const signUp = async (email, password, metadata = {}) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        return { data, error };
    };

    const signOut = async () => {
        localStorage.removeItem('auth_login_time');
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    const resetPassword = async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        return { data, error };
    };

    const updatePassword = async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        return { data, error };
    };

    const value = {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
