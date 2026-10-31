import { useState } from 'react';
import Home from './pages/Home.jsx';
import BottomNav from './components/BottomNav.jsx';

export default function App() {
  const [tab, setTab] = useState('home');

  return (
    <div className="app">
      <main className="screen">
        {tab === 'home' ? (
          <Home />
        ) : (
          <p className="placeholder">{tab} coming soon</p>
        )}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
