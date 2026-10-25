import React, { useEffect, useRef, useState } from 'react';

const RECORD_KEY = 'balloon_pop_best_score';

const colors = [
  { name: 'Rojo', value: '#ff5252' },
  { name: 'Azul', value: '#42a5f5' },
  { name: 'Verde', value: '#4cd964' },
  { name: 'Amarillo', value: '#ffd740' },
  { name: 'Morado', value: '#ba68c8' },
];

export default function BalloonPop({ onReturnToMenu }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  const stateRef = useRef({
    hands: null,
    camera: null,
    running: false,
    score: 0,
    timeLeft: 90,
    elapsed: 0,
    hand: null,
    lastTime: 0,
    spawnElapsed: 0,
    balloons: [],
    particles: [],
    targetColor: 0,
    balloonId: 0,
    correctHits: 0,
    wrongHits: 0,
    animationId: null,
    cameraReady: false,
  });

  // UI States
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [targetColorIndex, setTargetColorIndex] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [statusText, setStatusText] = useState('Presiona “Iniciar partida”.');
  const [reportHtml, setReportHtml] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const W = 720;
  const H = 480;

  const getBest = () => {
    try {
      return Number(localStorage.getItem(RECORD_KEY)) || 0;
    } catch {
      return 0;
    }
  };

  const saveRecord = (finalScore) => {
    const currentBest = getBest();
    if (finalScore > currentBest) {
      try {
        localStorage.setItem(RECORD_KEY, String(finalScore));
        setBestScore(finalScore);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const spawnBalloon = () => {
    const s = stateRef.current;
    const r = 23 + Math.random() * 9;
    s.balloons.push({
      id: s.balloonId++,
      x: 35 + r + Math.random() * (W - 70 - r * 2),
      y: H + 35,
      r,
      color: Math.floor(Math.random() * colors.length),
      speed: 35 + Math.random() * 35,
      wobble: Math.random() * Math.PI * 2,
    });
  };

  const burst = (x, y, color) => {
    const s = stateRef.current;
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 35 + Math.random() * 100;
      s.particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.65,
        color,
      });
    }
  };

  const popBalloon = (b) => {
    const s = stateRef.current;
    if (!s.running) return;
    const index = s.balloons.indexOf(b);
    if (index < 0) return;
    s.balloons.splice(index, 1);

    if (b.color === s.targetColor) {
      s.score += 10;
      s.correctHits++;
      setStatusText('¡Correcto! +10 puntos');
      burst(b.x, b.y, colors[b.color].value);
    } else {
      s.score = Math.max(0, s.score - 3);
      s.wrongHits++;
      setStatusText('Color incorrecto: −3 puntos');
      burst(b.x, b.y, '#d5deea');
    }

    s.targetColor = Math.floor(Math.random() * colors.length);
    setTargetColorIndex(s.targetColor);
    setScore(s.score);
  };

  const endGame = () => {
    const s = stateRef.current;
    if (!s.running) return;
    s.running = false;
    saveRecord(s.score);

    const total = s.correctHits + s.wrongHits;
    const accuracy = total ? Math.round((s.correctHits / total) * 100) : 0;
    const summary =
      total === 0
        ? 'No se registraron globos tocados.'
        : accuracy >= 80
        ? 'Proporción alta de aciertos en esta sesión.'
        : accuracy >= 50
        ? 'Proporción intermedia de aciertos en esta sesión.'
        : 'Proporción baja de aciertos en esta sesión.';

    setReportHtml({
      score: s.score,
      correctHits: s.correctHits,
      wrongHits: s.wrongHits,
      accuracy,
      elapsed: s.elapsed.toFixed(1),
      summary,
    });

    setStatusText(`Partida finalizada. Puntaje: ${s.score}`);
  };

  const resetGame = () => {
    const s = stateRef.current;
    s.score = 0;
    s.timeLeft = 90;
    s.elapsed = 0;
    s.spawnElapsed = 0;
    s.balloons = [];
    s.particles = [];
    s.balloonId = 0;
    s.correctHits = 0;
    s.wrongHits = 0;
    s.targetColor = Math.floor(Math.random() * colors.length);

    setScore(0);
    setTimeLeft(90);
    setTargetColorIndex(s.targetColor);
    setReportHtml(null);
  };

  const setupCamera = async () => {
    const s = stateRef.current;
    try {
      if (!window.Hands || !window.Camera) {
        throw new Error('No se cargaron las librerías de MediaPipe.');
      }
      if (!s.hands) {
        s.hands = new window.Hands({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        s.hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        s.hands.onResults((r) => {
          if (r.multiHandLandmarks && r.multiHandLandmarks.length) {
            const tip = r.multiHandLandmarks[0][8];
            s.hand = { x: 1 - tip.x, y: tip.y };
            if (!s.running) setStatusText('Mano detectada. Inicia la partida.');
          } else {
            s.hand = null;
          }
        });
      }
      if (!s.camera) {
        s.camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (s.hands && videoRef.current && videoRef.current.readyState >= 2) {
              await s.hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        await s.camera.start();
        s.cameraReady = true;
        setCameraActive(true);
        setStatusText('Cámara activada. Coloca tu mano frente a ella.');
      }
    } catch (e) {
      setStatusText('No se pudo activar la cámara: ' + (e.message || 'Error'));
    }
  };

  const startGame = async () => {
    const s = stateRef.current;
    if (!s.cameraReady) {
      await setupCamera();
    }
    resetGame();
    s.running = true;
    s.lastTime = performance.now();
    setStatusText('¡A jugar! Toca los globos del color indicado.');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    setBestScore(getBest());

    const drawBalloon = (b) => {
      const color = colors[b.color].value;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 0.83, b.r, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.65)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(b.x - b.r * 0.25, b.y - b.r * 0.35, 4, 7, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.65)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.r * 0.95);
      ctx.lineTo(b.x - 4, b.y + b.r + 7);
      ctx.lineTo(b.x + 4, b.y + b.r + 7);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.r + 7);
      ctx.lineTo(b.x + 2, b.y + b.r + 20);
      ctx.strokeStyle = '#d5deea';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#192c43');
      bg.addColorStop(1, '#314d6b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255,255,255,.06)';
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.arc(((i * 97 + 40) % W), ((i * 61 + 30) % H), 3, 0, Math.PI * 2);
        ctx.fill();
      }

      s.balloons.forEach(drawBalloon);

      s.particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life / 0.65);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (s.hand) {
        ctx.beginPath();
        ctx.arc(s.hand.x * W, s.hand.y * H, 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      if (!s.running) {
        ctx.fillStyle = 'rgba(0,0,0,.48)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 27px Arial';
        ctx.fillText('BALLOON POP', W / 2, H / 2 - 10);
        ctx.font = '17px Arial';
        ctx.fillText('Pulsa Iniciar partida para jugar', W / 2, H / 2 + 25);
      }
    };

    const update = (dt) => {
      if (!s.running) return;
      s.elapsed += dt;
      s.timeLeft = Math.max(0, s.timeLeft - dt);
      setTimeLeft(Math.ceil(s.timeLeft));

      if (s.timeLeft <= 0) {
        endGame();
        return;
      }

      // Los globos aparecen más seguido y ascienden más rápido con el tiempo.
      const spawnRate = Math.max(0.22, 0.48 - s.elapsed * 0.0025);
      s.spawnElapsed += dt;
      if (s.spawnElapsed >= spawnRate) {
        s.spawnElapsed = 0;
        spawnBalloon();
      }

      const speedMultiplier = 1 + Math.min(s.elapsed * 0.012, 1.5);
      s.balloons.forEach((b) => {
        b.y -= b.speed * speedMultiplier * dt;
        b.wobble += dt * 2.2;
        b.x += Math.sin(b.wobble) * 12 * dt;
      });

      s.balloons = s.balloons.filter((b) => b.y > -50);
      s.particles = s.particles.filter((p) => p.life > 0);
      s.particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 100 * dt;
        p.life -= dt;
      });

      if (s.hand) {
        const px = s.hand.x * W;
        const py = s.hand.y * H;
        for (let i = s.balloons.length - 1; i >= 0; i--) {
          const b = s.balloons[i];
          if (Math.hypot(px - b.x, py - b.y) < b.r + 12) {
            popBalloon(b);
            break;
          }
        }
      }
    };

    const loop = (now) => {
      const dt = Math.min(Math.max(0, (now - s.lastTime) / 1000), 0.04);
      s.lastTime = now;
      update(dt);
      draw();
      s.animationId = requestAnimationFrame(loop);
    };

    s.animationId = requestAnimationFrame(loop);

    // CLEANUP ON UNMOUNT
    return () => {
      if (s.animationId) cancelAnimationFrame(s.animationId);
      if (s.camera) {
        try {
          s.camera.stop();
        } catch (e) {
          console.warn('Camera stop error', e);
        }
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (s.hands) {
        try {
          s.hands.close();
        } catch (e) {
          console.warn('Hands close error', e);
        }
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px', width: '100%' }}>
      {/* Header Original */}
      <header className="project-banner teal-theme">
        <div className="banner-badge teal">UNIVERSIDAD COOPERATIVA DE COLOMBIA</div>
        <h1 className="banner-title teal">BALLOON POP · EVALUACIÓN COGNITIVA</h1>
        <p className="banner-subtitle">Ingeniería de Sistemas · 6.º Semestre · Aplicaciones de la Inteligencia Artificial</p>

        <div className="banner-meta">
          <div className="meta-item">
            <small>Desarrolladores</small>
            <strong>Royber Zayas (911670) & Alexandra Parra (914953)</strong>
          </div>
          <div className="meta-item">
            <small>Docente</small>
            <strong>Jhon Freddy Linares</strong>
          </div>
        </div>
      </header>

      {/* Top action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="status-bar" aria-live="polite">
          <span style={{ color: '#ffd166' }}>●</span> <b>Estado:</b> {statusText}
        </div>
        <button
          onClick={onReturnToMenu}
          className="nav-btn"
          style={{ background: 'rgba(255,255,255,0.08)', fontSize: '0.82rem' }}
        >
          ← Volver al Menú
        </button>
      </div>

      {/* Main Grid: Game Stage + Aside Info */}
      <div className="main-layout" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left Column: Canvas Stage, Actions & Report */}
        <section>
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--panel-border)',
              borderRadius: '20px',
              padding: '18px',
              marginBottom: '18px',
            }}
          >
            {/* HUD */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div className="stat">
                <small>Puntaje</small>
                <strong style={{ color: 'var(--teal)' }}>{score}</strong>
              </div>
              <div className="stat">
                <small>Tiempo</small>
                <strong>{timeLeft}s</strong>
              </div>
              <div className="stat">
                <small>Color Objetivo</small>
                <strong style={{ color: colors[targetColorIndex].value }}>
                  {colors[targetColorIndex].name}
                </strong>
              </div>
              <div className="stat">
                <small>Récord</small>
                <strong style={{ color: '#ffd166' }}>{bestScore}</strong>
              </div>
            </div>

            {/* Canvas */}
            <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: '#192c43' }}>
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                style={{ width: '100%', display: 'block', borderRadius: '10px' }}
              />
              <video ref={videoRef} playsInline style={{ display: 'none' }} />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
              <button className="game-btn game-btn-teal" onClick={startGame}>
                Iniciar partida 🎈
              </button>
              <button
                className="nav-btn"
                onClick={setupCamera}
                style={{
                  background: cameraActive ? 'rgba(32,201,151,0.15)' : 'rgba(255,255,255,0.08)',
                  borderColor: cameraActive ? 'var(--teal)' : 'var(--panel-border)',
                }}
              >
                {cameraActive ? '✓ Cámara Activa' : 'Activar cámara'}
              </button>
              <button
                className="nav-btn"
                onClick={() => {
                  resetGame();
                  setStatusText('Partida reiniciada. Pulsa Iniciar partida.');
                }}
              >
                Reiniciar
              </button>
            </div>
          </div>

          {/* Performance Report */}
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--panel-border)',
              borderRadius: '20px',
              padding: '18px',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: '0 0 8px' }}>
              📊 Informe de Desempeño
            </h2>
            <p className="bp-note" style={{ margin: '0 0 12px' }}>
              El resumen utiliza los resultados registrados durante la partida. No es una prueba psicológica clínica ni
              una herramienta diagnóstica.
            </p>

            {reportHtml ? (
              <div className="bp-report">
                <h3>Resultado de la partida</h3>
                <div className="bp-metric">
                  <span>Puntaje final:</span>
                  <strong>{reportHtml.score} pts</strong>
                </div>
                <div className="bp-metric">
                  <span>Globos correctos:</span>
                  <strong style={{ color: 'var(--teal)' }}>{reportHtml.correctHits}</strong>
                </div>
                <div className="bp-metric">
                  <span>Globos incorrectos:</span>
                  <strong style={{ color: 'var(--accent)' }}>{reportHtml.wrongHits}</strong>
                </div>
                <div className="bp-metric">
                  <span>Precisión de la tarea:</span>
                  <strong style={{ color: '#ffd166' }}>{reportHtml.accuracy}%</strong>
                </div>
                <div className="bp-metric">
                  <span>Tiempo jugado:</span>
                  <strong>{reportHtml.elapsed} s</strong>
                </div>
                <p style={{ marginTop: '10px', color: '#c1cbe5' }}>{reportHtml.summary}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
                  La precisión corresponde a aciertos divididos por el total de globos tocados.
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed var(--panel-border)',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: '0.88rem',
                }}
              >
                Completa una partida de 90 segundos para generar el informe.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Rules, Best Score & Indicators */}
        <aside>
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--panel-border)',
              borderRadius: '20px',
              padding: '18px',
              marginBottom: '18px',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 10px', fontSize: '1.1rem' }}>
              ¿Cómo jugar?
            </h3>
            <p className="bp-note">
              1. Activa la cámara y usa la punta del dedo índice para tocar los globos.
              <br />
              2. Busca el color objetivo indicado en pantalla.
              <br />
              3. Acierto: <b>+10 puntos</b>; error: <b>−3 puntos</b> (sin bajar de cero).
            </p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />
            <h4 style={{ margin: '0 0 6px', color: '#ffd166', fontSize: '0.95rem' }}>🏆 Récord personal</h4>
            <div className="bp-record">{bestScore} puntos</div>
            <p className="bp-note" style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              El récord se guarda en este navegador con <code>localStorage</code>.
            </p>
          </div>

          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--panel-border)',
              borderRadius: '20px',
              padding: '18px',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 10px', fontSize: '1.1rem' }}>
              Indicadores del juego
            </h3>
            <p className="bp-note">
              Se registran aciertos, errores, precisión y duración. Son indicadores descriptivos del juego, no una
              evaluación psicológica clínica ni una herramienta diagnóstica.
            </p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />
            <h4 style={{ margin: '0 0 6px', color: '#f4f7ff', fontSize: '0.92rem' }}>Créditos académicos</h4>
            <p className="bp-note" style={{ fontSize: '0.82rem' }}>
              <strong>Programa:</strong> Ingeniería de Sistemas
              <br />
              <strong>Asignatura:</strong> Aplicaciones de la IA
              <br />
              <strong>Estudiantes:</strong> Royber Zayas (911670) & Alexandra Parra (914953)
              <br />
              <strong>Docente:</strong> Jhon Freddy Linares
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
