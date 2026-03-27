import { useState } from 'react';
import useAuth from './hooks/useAuth.js';
import WelcomeScreen from './features/welcome/WelcomeScreen.jsx';
import HomeScreen from './features/home/HomeScreen.jsx';
import DrillPage from './features/drills/DrillPage.jsx';
import { updateLeaderboardEntry } from './data/leaderboard.js';
import './App.css';

function App() {
  const { user, login, logout, isLoggedIn } = useAuth();
  const [screen, setScreen] = useState(isLoggedIn ? 'home' : 'welcome');

  // Load persistent stats for home screen
  const loadPersistent = () => {
    try {
      return {
        totalXp: parseInt(localStorage.getItem('flopiq_xp') || '0', 10),
        bestStreakAllTime: parseInt(localStorage.getItem('flopiq_best_streak') || '0', 10),
        ...(JSON.parse(localStorage.getItem('flopiq_lifetime') || '{"totalSessions":0,"totalCorrect":0,"totalAnswered":0}')),
      };
    } catch {
      return { totalXp: 0, bestStreakAllTime: 0, totalSessions: 0, totalCorrect: 0, totalAnswered: 0 };
    }
  };

  function handleLogin(displayName) {
    const u = login(displayName);
    // Sync existing stats to leaderboard
    const stats = loadPersistent();
    updateLeaderboardEntry(u.id, displayName, stats);
    setScreen('home');
  }

  function handleLogout() {
    logout();
    setScreen('welcome');
  }

  function handleStartDrills() {
    setScreen('drills');
  }

  function handleBackToHome() {
    // Sync latest stats to leaderboard when returning
    if (user) {
      const stats = loadPersistent();
      updateLeaderboardEntry(user.id, user.displayName, stats);
    }
    setScreen('home');
  }

  if (screen === 'welcome' || !isLoggedIn) {
    return <WelcomeScreen onLogin={handleLogin} />;
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
            persistent={loadPersistent()}
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
        <DrillPage user={user} />
      </main>
    </div>
  );
}

export default App;
