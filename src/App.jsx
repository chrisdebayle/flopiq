import { useState, useEffect } from 'react';
import useAuth from './hooks/useAuth.js';
import WelcomeScreen from './features/welcome/WelcomeScreen.jsx';
import HomeScreen from './features/home/HomeScreen.jsx';
import DrillPage from './features/drills/DrillPage.jsx';
import { getProfile, upsertProfile, trackEvent } from './lib/supabase.js';
import './App.css';

function App() {
  const { user, enterGame, logout, isLoggedIn, loading, error: authError, setError: setAuthError } = useAuth();
  const [screen, setScreen] = useState('welcome');
  const [persistent, setPersistent] = useState({
    totalXp: 0, bestStreakAllTime: 0, totalSessions: 0,
    totalCorrect: 0, totalAnswered: 0, bestSessionPct: 0,
  });

  // Once user is loaded, determine screen and fetch profile
  useEffect(() => {
    if (loading) return;
    if (isLoggedIn) {
      setScreen('home');
      // Fetch profile from Supabase
      getProfile(user.id).then(profile => {
        if (profile) {
          setPersistent({
            totalXp: profile.total_xp || 0,
            bestStreakAllTime: profile.best_streak || 0,
            totalSessions: profile.sessions_played || 0,
            totalCorrect: profile.total_correct || 0,
            totalAnswered: profile.total_answered || 0,
            bestSessionPct: profile.best_session_pct || 0,
          });
        }
      }).catch(err => console.warn('Profile fetch error:', err.message));
      trackEvent(user.id, 'session_restore', { method: 'anonymous' });
    } else {
      setScreen('welcome');
    }
  }, [loading, isLoggedIn, user]);

  async function handleEnter(displayName) {
    const u = await enterGame(displayName);
    if (u) {
      trackEvent(u.id, 'signup', { method: 'anonymous' });
    }
  }

  async function handleLogout() {
    if (user) trackEvent(user.id, 'logout', {});
    await logout();
    setPersistent({
      totalXp: 0, bestStreakAllTime: 0, totalSessions: 0,
      totalCorrect: 0, totalAnswered: 0, bestSessionPct: 0,
    });
  }

  function handleStartDrills() {
    if (user) trackEvent(user.id, 'start_drills', {});
    setScreen('drills');
  }

  async function handleBackToHome() {
    // Refresh profile from Supabase to get latest stats
    if (user) {
      try {
        const profile = await getProfile(user.id);
        if (profile) {
          setPersistent({
            totalXp: profile.total_xp || 0,
            bestStreakAllTime: profile.best_streak || 0,
            totalSessions: profile.sessions_played || 0,
            totalCorrect: profile.total_correct || 0,
            totalAnswered: profile.total_answered || 0,
            bestSessionPct: profile.best_session_pct || 0,
          });
        }
      } catch (err) {
        console.warn('Profile refresh error:', err.message);
      }
    }
    setScreen('home');
  }

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0e14', color: '#556', fontSize: 16, fontWeight: 600,
      }}>
        Loading...
      </div>
    );
  }

  if (screen === 'welcome' || !isLoggedIn) {
    return (
      <WelcomeScreen
        onEnter={handleEnter}
        authError={authError}
        setAuthError={setAuthError}
      />
    );
  }

  if (screen === 'home') {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <h1 className="logo-title">FlopIQ</h1>
              <span className="logo-subtitle">Think Better. Stack Faster.</span>
            </div>
          </div>
        </header>
        <main className="app-main">
          <HomeScreen
            user={user}
            persistent={persistent}
            onStartDrills={handleStartDrills}
            onLogout={handleLogout}
          />
        </main>
      </div>
    );
  }

  // Drills screen
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-row">
            <button onClick={handleBackToHome} className="back-btn" aria-label="Back to home">
              &larr;
            </button>
            <div className="logo">
              <h1 className="logo-title">FlopIQ</h1>
              <span className="logo-subtitle">Think Better. Stack Faster.</span>
            </div>
          </div>
        </div>
      </header>
      <main className="app-main">
        <DrillPage user={user} persistent={persistent} />
      </main>
    </div>
  );
}

export default App;
