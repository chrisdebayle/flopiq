import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing — running in offline mode');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ── Auth helpers (anonymous auth) ──

export async function checkDisplayNameTaken(displayName) {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, total_xp')
    .ilike('display_name', displayName)
    .limit(1);
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function signInAnonymously(displayName) {
  if (!supabase) throw new Error('Supabase not configured');

  // Check if name is taken — if so, caller should use reclaimProfile instead
  const existing = await checkDisplayNameTaken(displayName);
  if (existing) {
    const err = new Error('NAME_TAKEN');
    err.existingProfile = existing;
    throw err;
  }

  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data;
}

export async function reclaimProfile(displayName) {
  if (!supabase) throw new Error('Supabase not configured');

  // Create a new anonymous session
  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;

  const newUserId = data.session?.user?.id;
  if (!newUserId) throw new Error('Failed to create session');

  // Transfer the old profile stats to the new user via RPC
  const { error: rpcError } = await supabase.rpc('reclaim_profile', {
    p_display_name: displayName,
    p_new_user_id: newUserId,
  });
  if (rpcError) throw rpcError;

  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Profile helpers ──

export async function getProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertProfile(userId, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Leaderboard ──

export async function getLeaderboard(limit = 10) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, total_xp, best_streak, best_session_pct, total_correct, total_answered')
    .order('total_xp', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((p, i) => ({
    ...p,
    rank: i + 1,
    compositeScore: p.total_xp + (p.best_streak * 20) + (p.best_session_pct * 5),
  }));
}

export async function getUserRankFromDb(userId) {
  // Get all profiles ordered by XP, find user's position
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .order('total_xp', { ascending: false });
  if (error) throw error;
  const idx = (data || []).findIndex(p => p.id === userId);
  return idx >= 0 ? idx + 1 : null;
}

// ── Session persistence ──

export async function saveSession(userId, sessionData) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      correct: sessionData.correct,
      total: sessionData.total,
      grade: sessionData.grade,
      xp_earned: sessionData.xpEarned,
      best_streak: sessionData.bestStreak,
      duration_ms: sessionData.durationMs,
      category_breakdown: sessionData.categoryBreakdown || {},
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserSessions(userId, limit = 20) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ── Scenario results ──

export async function saveScenarioResults(userId, sessionId, results) {
  if (!supabase || !results.length) return;
  const rows = results.map(r => ({
    user_id: userId,
    session_id: sessionId,
    scenario_id: r.scenarioId,
    correct: r.correct,
    action_chosen: r.actionChosen,
    bet_type_chosen: r.betTypeChosen || null,
    opponent_type: r.opponentType || null,
  }));
  const { error } = await supabase.from('scenario_results').insert(rows);
  if (error) throw error;
}

// ── Analytics ──

export async function trackEvent(userId, eventType, metadata = {}) {
  if (!supabase) return;
  const { error } = await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: eventType,
    metadata,
  });
  // Don't throw on analytics failures — they're non-critical
  if (error) console.warn('Analytics event failed:', error.message);
}
