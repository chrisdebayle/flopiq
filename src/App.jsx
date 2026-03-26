import { SpeedInsights } from '@vercel/speed-insights/react';
import DrillPage from './features/drills/DrillPage.jsx';
import './App.css';

function App() {
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
        <DrillPage />
      </main>
      <SpeedInsights />
    </div>
  );
}

export default App;
