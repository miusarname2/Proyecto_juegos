import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MainMenu from './components/MainMenu';
import FingerRacer from './components/FingerRacer';
import BalloonPop from './components/BalloonPop';

export default function App() {
  const [currentView, setCurrentView] = useState('menu');

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'menu' && <MainMenu onSelectGame={handleNavigate} />}
        {currentView === 'car' && <FingerRacer onReturnToMenu={() => handleNavigate('menu')} />}
        {currentView === 'balloons' && <BalloonPop onReturnToMenu={() => handleNavigate('menu')} />}
      </main>
    </div>
  );
}
