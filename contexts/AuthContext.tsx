'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin' | null;
  created_at: string | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async (supabaseUser: SupabaseAuthUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('id', supabaseUser.id)
      .single<ProfileRow>();

    if (error) {
      console.error('Failed to load profile', error);
    }

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile?.full_name || supabaseUser.email?.split('@')[0] || '',
      role: (profile?.role as User['role']) || 'user',
      createdAt: profile?.created_at || supabaseUser.created_at || new Date().toISOString(),
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      hydrateUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      hydrateUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, hydrateUser]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    await hydrateUser(data.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('User record missing after signup');
    }

    // Ensure profile row exists for metadata & RBAC purposes
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: name,
      role: 'user',
    });

    if (profileError) {
      console.error('Failed to upsert profile', profileError);
      throw profileError;
    }

    await hydrateUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await hydrateUser(data.session?.user ?? null);
  }, [hydrateUser, supabase]);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}