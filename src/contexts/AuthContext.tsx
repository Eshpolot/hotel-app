import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let revision = 0;
    const syncSession = async (next: Session | null) => {
      const current = ++revision;
      setSession(next); setUser(next?.user ?? null); setProfile(null); setIsLoading(true);
      try {
        if (next?.user) {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', next.user.id).single();
          if (active && current === revision) setProfile(error ? null : data as Profile);
        }
      } catch {
        if (active && current === revision) setProfile(null);
      } finally {
        if (active && current === revision) setIsLoading(false);
      }
    };
    // Defer database requests outside the auth callback to avoid auth-lock deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setTimeout(() => { if (active) void syncSession(next); }, 0);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (active && revision === 0) void syncSession(error ? null : data.session);
    }).catch(() => { if (active) setIsLoading(false); });
    return () => { active = false; revision++; subscription.unsubscribe(); };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signInWithGoogle, signInWithEmail, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
