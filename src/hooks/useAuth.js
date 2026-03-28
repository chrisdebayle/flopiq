import { useState, useCallback, useEffect } from 'react';
import { supabase, signInAnonymously, signOut, getProfile } from '../lib/supabase.js';

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
          if (profile) {
            setUser({
              id: session.user.id,
              displayName: profile.display_name || session.user.user_metadata?.display_name || 'Player',
            });
          } else {
            // Profile was deleted (e.g. duplicate cleanup) — sign out stale session
            await supabase.auth.signOut();
          }
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
            if (profile) {
              setUser({
                id: session.user.id,
                displayName: profile.display_name || session.user.user_metadata?.display_name || 'Player',
              });
            } else {
              await supabase.auth.signOut();
            }
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

  const enterGame = useCallback(async (displayName) => {
    setError(null);
    try {
      const { session } = await signInAnonymously(displayName);
      if (session?.user) {
        const u = {
          id: session.user.id,
          displayName,
        };
        setUser(u);
        return u;
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

  return { user, enterGame, logout, isLoggedIn: !!user, loading, error, setError };
}
