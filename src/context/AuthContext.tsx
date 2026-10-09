import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/store';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: 'customer' | 'admin';
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [loading, setLoading] = useState(true);

  // Fetch profile and role from Supabase
  const loadUserDetails = useCallback(async (currentUser: User) => {
    if (!isSupabaseConfigured) return;

    try {
      // 1. Fetch profile
      const { data: profileData } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          id: profileData.id,
          fullName: profileData.full_name,
          phone: profileData.phone,
          avatarUrl: profileData.avatar_url,
          email: currentUser.email,
          createdAt: profileData.created_at,
        });
      } else {
        // Fallback profile if row is not created yet
        setProfile({
          id: currentUser.id,
          fullName: currentUser.user_metadata?.full_name || '',
          phone: null,
          avatarUrl: null,
          email: currentUser.email,
        });
      }

      // 2. Fetch role from user_roles
      const { data: roleData } = await (supabase
        .from('user_roles') as any)
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData && roleData.role === 'admin') {
        setRole('admin');
      } else {
        setRole('customer');
      }
    } catch (err) {
      console.warn('[Zenvilo Auth] Error loading user details:', err);
      setRole('customer');
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        await loadUserDetails(currentSession.user);
      } else {
        setProfile(null);
        setRole('customer');
      }
    } catch (err) {
      console.warn('[Zenvilo Auth] Session refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [loadUserDetails]);

  useEffect(() => {
    refreshAuth();

    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await loadUserDetails(newSession.user);
      } else {
        setProfile(null);
        setRole('customer');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAuth, loadUserDetails]);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Database is not connected. Configure Supabase credentials in .env' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        // Also ensure profile record exists
        try {
          await (supabase.from('profiles') as any).upsert({
            id: data.user.id,
            full_name: fullName,
          });
        } catch {
          // Profile trigger may have already handled this
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Database is not connected. Configure Supabase credentials in .env' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };

      // Record login activity in background
      try {
        const { data: uData } = await supabase.auth.getUser();
        if (uData?.user) {
          (supabase.from('login_activity') as any).insert({
            user_id: uData.user.id,
            email: uData.user.email,
            login_at: new Date().toISOString(),
            login_status: 'success',
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          }).then(() => {}).catch(() => {});
        }
      } catch (_) {}

      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Login failed' };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole('customer');
    } catch (err) {
      console.error('[Zenvilo Auth] Sign out error:', err);
    }
  };

  const requestPasswordReset = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#auth?tab=reset`,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to request reset link' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to update password' };
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: 'Not logged in' };
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: data.fullName,
          phone: data.phone,
          avatar_url: data.avatarUrl,
        })
        .eq('id', user.id);

      if (error) return { error: error.message };
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to update profile' };
    }
  };

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isAdmin,
        loading,
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        updatePassword,
        updateProfile,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
