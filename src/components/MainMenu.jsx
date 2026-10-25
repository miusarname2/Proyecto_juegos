import React, { useState, useEffect } from 'react';

export default function MainMenu({ onSelectGame }) {
  const [carBest, setCarBest] = useState(0);
  const [carTopPilot, setCarTopPilot] = useState('Nadie');
  const [balloonBest, setBalloonBest] = useState(0);
  const [camTesting, setCamTesting] = useState(false);
  const [camError, setCamError] = useState(null);
  const [camStream, setCamStream] = useState(null);

  useEffect(() => {
    // Read local records
    try {
      const carRecordsRaw = localStorage.getItem('finger_racer_records');
      if (carRecordsRaw) {
        const records = JSON.parse(carRecordsRaw);
        if (records.length > 0) {
          setCarBest(records[0].score);
          setCarTopPilot(records[0].name);
        }
      }
    } catch (e) {
      console.warn('Error reading car records', e);
    }

    try {
      const balloonBestRaw = localStorage.getItem('balloon_pop_best_score');
      if (balloonBestRaw) {
        setBalloonBest(Number(balloonBestRaw) || 0);
      }
    } catch (e) {
      console.warn('Error reading balloon records', e);
    }
  }, []);

  // Cleanup camera test if active on unmount
  useEffect(() => {
    return () => {
      if (camStream) {
        camStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camStream]);

  const toggleCamTest = async () => {
    if (camTesting) {
      if (camStream) {
        camStream.getTracks().forEach((track) => track.stop());
        setCamStream(null);
      }
      setCamTesting(false);
      setCamError(null);
      return;
    }

    setCamError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador o entorno no soporta getUserMedia.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      setCamStream(stream);
      setCamTesting(true);
    } catch (err) {
      setCamError(err.message || 'No se pudo acceder a la cámara. Revisa permisos.');
      setCamTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {/* Hero Banner */}
      <header className="project-banner">
        <div className="banner-badge">UNIVERSIDAD COOPERATIVA DE COLOMBIA</div>
        <h1 className="banner-title">SUITE COGNITIVA · HAND TRACKING IA</h1>
        <p className="banner-subtitle">
          Ingeniería de Sistemas · 6.º Semestre · Asignatura: Aplicaciones de la Inteligencia Artificial
        </p>

        <div className="banner-meta">
          <div className="meta-item">
            <small>Nueva Versión Unificada (SPA)</small>
            <strong style={{ color: '#2ed573' }}>Oscar M. Alvarez G.</strong>
          </div>
          <div className="meta-item">
            <small>Versión Original Base</small>
            <strong>Royber Zayas (911670) & Alexandra Parra (914953)</strong>
          </div>
          <div className="meta-item">
            <small>Docente Titular</small>
            <strong>Jhon Freddy Linares · UCC</strong>
          </div>
        </div>
      </header>

      {/* Quick Camera Diagnostic Pill */}
      <div
        style={{
          background: 'rgba(20, 29, 54, 0.7)',
          border: '1px solid var(--panel-border)',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>📹</span>
          <div>
            <strong style={{ fontSize: '0.95rem', display: 'block' }}>Control por Gestos y Visión en Vivo</strong>
            <small style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
              Los juegos utilizan tu dedo índice detectado por IA sin necesidad de periféricos adicionales.
            </small>
          </div>
        </div>
        <button
          onClick={toggleCamTest}
          className="nav-btn"
          style={{
            borderColor: camTesting ? 'var(--good)' : 'rgba(255,255,255,0.2)',
            color: camTesting ? 'var(--good)' : 'var(--text)',
          }}
        >
          {camTesting ? '✓ Cámara Conectada (Detener)' : '🔍 Probar Acceso a Cámara'}
        </button>
      </div>

      {camError && (
        <div
          style={{
            background: 'rgba(255, 71, 87, 0.15)',
            border: '1px solid rgba(255, 71, 87, 0.4)',
            color: '#ff8a95',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.88rem',
          }}
        >
          ⚠️ <b>Aviso de cámara:</b> {camError}. Recuerda permitir el acceso en tu navegador y ejecutar sobre HTTPS o localhost.
        </div>
      )}

      {camTesting && camStream && (
        <div
          style={{
            marginBottom: '28px',
            background: '#080d1a',
            borderRadius: '18px',
            padding: '16px',
            textAlign: 'center',
            border: '1px solid var(--good)',
          }}
        >
          <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--good)' }}>
            ● Vista previa de cámara en tiempo real. Coloca tu mano frente a la lente:
          </p>
          <video
            autoPlay
            playsInline
            muted
            ref={(vid) => {
              if (vid && camStream && vid.srcObject !== camStream) {
                vid.srcObject = camStream;
              }
            }}
            style={{
              width: '320px',
              maxWidth: '100%',
              borderRadius: '12px',
              transform: 'scaleX(-1)',
              border: '2px solid rgba(46, 213, 115, 0.4)',
            }}
          />
        </div>
      )}

      {/* Game Cards Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Game 1: Finger Racer */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(20, 29, 54, 0.95), rgba(11, 16, 32, 0.95))',
            border: '1px solid rgba(255, 71, 87, 0.35)',
            borderRadius: '24px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(255, 71, 87, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <span style={{ fontSize: '3rem' }}>🏎️</span>
              <span
                style={{
                  background: 'rgba(255, 71, 87, 0.15)',
                  border: '1px solid rgba(255, 71, 87, 0.4)',
                  color: '#ff8a95',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Métrica: Reflejos & Reacción
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.65rem',
                margin: '0 0 10px',
                color: '#ffffff',
                fontWeight: 900,
              }}
            >
              Finger Racer
            </h2>

            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 18px' }}>
              Supervivencia automovilística de alta velocidad. Conduce con la yema del dedo índice, esquiva rocas y conos
              mientras la velocidad se acelera dinámicamente y recoge estrellas doradas.
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Evaluación cognitiva:</span>
                <strong style={{ color: '#ff6b81' }}>Coordinación viso-motora</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Dificultad:</span>
                <span style={{ color: '#ffa502' }}>Progresiva (Aceleración exponencial)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--muted)' }}>Mejor récord:</span>
                <strong style={{ color: 'var(--good)' }}>
                  {carBest} pts {carTopPilot !== 'Nadie' ? `(${carTopPilot})` : ''}
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectGame('car')}
            className="game-btn"
            style={{ width: '100%', fontSize: '1.05rem', padding: '14px' }}
          >
            Jugar Finger Racer 🏎️
          </button>
        </div>

        {/* Game 2: Balloon Pop */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(20, 29, 54, 0.95), rgba(11, 16, 32, 0.95))',
            border: '1px solid rgba(32, 201, 151, 0.35)',
            borderRadius: '24px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(32, 201, 151, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <span style={{ fontSize: '3rem' }}>🎈</span>
              <span
                style={{
                  background: 'rgba(32, 201, 151, 0.15)',
                  border: '1px solid rgba(32, 201, 151, 0.4)',
                  color: '#38dda0',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Métrica: Atención & Control
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.65rem',
                margin: '0 0 10px',
                color: '#ffffff',
                fontWeight: 900,
              }}
            >
              Balloon Pop
            </h2>

            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 18px' }}>
              Desafío de discriminación y precisión en 90 segundos. Toca con tu dedo únicamente los globos del color
              objetivo activo (+10 pts) y suprime el impulso de tocar colores trampa (−3 pts).
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Evaluación cognitiva:</span>
                <strong style={{ color: '#38dda0' }}>Atención selectiva e inhibitoria</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Duración:</span>
                <span style={{ color: '#ffd34e' }}>90 segundos cronometrados</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--muted)' }}>Mejor récord:</span>
                <strong style={{ color: 'var(--good)' }}>{balloonBest} pts</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectGame('balloons')}
            className="game-btn game-btn-teal"
            style={{ width: '100%', fontSize: '1.05rem', padding: '14px' }}
          >
            Jugar Balloon Pop 🎈
          </button>
        </div>
      </div>

      {/* Cognitive Assessment & Academic Note */}
      <section
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--panel-border)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '28px',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            margin: '0 0 12px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🧠 Fundamentación Psicomotora y Ética de la Evaluación
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 12px' }}>
          En el contexto de la asignatura <b>Aplicaciones de la Inteligencia Artificial</b>, estos minijuegos implementan
          sensores no invasivos basados en visión por computadora para registrar variables del comportamiento motor fino.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
          <b>Aviso descriptivo:</b> Los indicadores calculados al final de cada partida (tiempo de supervivencia, tasa de
          precisión, aciertos/errores y diagnósticos en el HUD) constituyen métricas descriptivas del desempeño lúdico del
          jugador y <b>no</b> representan una evaluación clínica o psicológica diagnóstica formal.
        </p>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '20px',
          color: 'var(--muted)',
          fontSize: '0.82rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          lineHeight: 1.6,
        }}
      >
        © 2026 Universidad Cooperativa de Colombia (UCC) · Nueva versión unificada desarrollada por <b>Oscar M. Alvarez G.</b><br />
        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
          Juegos conceptuales originales creados por Royber José Zayas Herrera & Alexandra Parra Díaz · Docente: Jhon Freddy Linares
        </span>
      </footer>
    </div>
  );
}
