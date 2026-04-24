import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  dark_mode: boolean;
  has_pin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  updatePin: (pin: string) => Promise<{ error: string | null }>;
  signInWithPin: (email: string, pin: string) => Promise<{ error: string | null }>;
  checkUserStatus: (email: string) => Promise<{ exists: boolean; hasPin: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + (import.meta.env.BASE_URL || '/'),
      },
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    return { error: null };
  };

  const updatePin = async (pin: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'No user logged in' };

    // Update the auth password
    const { error: authError } = await supabase.auth.updateUser({
      password: pin
    });

    if (authError) return { error: authError.message };

    // Mark that the user has a pin in their profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ has_pin: true })
      .eq('id', user.id);

    if (profileError) return { error: profileError.message };

    setProfile((prev) => (prev ? { ...prev, has_pin: true } : null));
    return { error: null };
  };

  const signInWithPin = async (email: string, pin: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const checkUserStatus = async (email: string): Promise<{ exists: boolean; hasPin: boolean }> => {
    // We'll use a public RPC or a carefully scoped query
    // For now, we'll try to fetch the profile. 
    // IMPORTANT: This requires an RLS policy that allows searching by email.
    const { data, error } = await supabase
      .from('profiles')
      .select('has_pin')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) return { exists: false, hasPin: false };
    return { exists: true, hasPin: !!data.has_pin };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signInWithMagicLink,
        signOut,
        updateProfile,
        updatePin,
        signInWithPin,
        checkUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
