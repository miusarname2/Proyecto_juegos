import React from 'react';

export default function Navbar({ currentView, onNavigate }) {
  return (
    <header className="app-nav">
      <div className="nav-left">
        <button className="nav-brand" onClick={() => onNavigate('menu')} title="Ir al Menú Principal">
          <span>🎮 AI Suite UCC</span>
          <span className="nav-brand-badge">IA & VISIÓN</span>
        </button>

        {currentView === 'car' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#ff6b81', fontWeight: 700, background: 'rgba(255, 71, 87, 0.1)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255, 71, 87, 0.3)' }}>
            🏎️ Finger Racer
          </span>
        )}

        {currentView === 'balloons' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#38dda0', fontWeight: 700, background: 'rgba(32, 201, 151, 0.1)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(32, 201, 151, 0.3)' }}>
            🎈 Balloon Pop
          </span>
        )}
      </div>

      <div className="nav-right">
        {currentView !== 'menu' && (
          <button className="nav-btn" onClick={() => onNavigate('menu')}>
            🏠 Menú Principal
          </button>
        )}

        {currentView === 'car' && (
          <button className="nav-btn nav-btn-teal" onClick={() => onNavigate('balloons')}>
            Jugar Balloon Pop 🎈
          </button>
        )}

        {currentView === 'balloons' && (
          <button className="nav-btn nav-btn-primary" onClick={() => onNavigate('car')}>
            Jugar Finger Racer 🏎️
          </button>
        )}

        {currentView === 'menu' && (
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
            UCC · Ingeniería de Sistemas
          </span>
        )}
      </div>
    </header>
  );
}
