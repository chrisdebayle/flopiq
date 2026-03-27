import { useState, useCallback, useEffect } from 'react';
import { supabase, signUp, signIn, signOut, getProfile } from '../lib/supabase.js';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, check for existing Supabase session
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        if (!supabase) { setLoading(false); return; }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const profile = await getProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName: profile?.display_name || session.user.user_metadata?.display_name || 'Player',
          });
        }
      } catch (err) {
        console.warn('Auth init error:', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Listen for auth state changes (login/logout from other tabs)
    const { data: { subscription } } = supabase
      ? supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await getProfile(session.user.id);
            setUser({
              id: session.user.id,
              email: session.user.email,
              displayName: profile?.display_name || session.user.user_metadata?.display_name || 'Player',
            });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        })
      : { subscription: null };

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { session } = await signIn(email, password);
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        const u = {
          id: session.user.id,
          email: session.user.email,
          displayName: profile?.display_name || 'Player',
        };
        setUser(u);
        return u;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    setError(null);
    try {
      const { session, user: authUser } = await signUp(email, password, displayName);
      // If email confirmation is disabled, session is returned immediately
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email,
          displayName,
        };
        setUser(u);
        return u;
      }
      // If email confirmation is enabled, user exists but no session yet
      if (authUser) {
        return { needsConfirmation: true, email };
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return { user, login, register, logout, isLoggedIn: !!user, loading, error, setError };
}
