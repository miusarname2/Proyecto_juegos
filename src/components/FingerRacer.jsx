import React, { useEffect, useRef, useState } from 'react';

export default function FingerRacer({ onReturnToMenu }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const stateRef = useRef({
    hands: null,
    camera: null,
    running: false,
    gameOver: false,
    score: 0,
    baseSpeed: 220,
    roadOffset: 0,
    startTime: 0,
    elapsedTime: 0,
    car: { x: 480, y: 440, targetX: 480, targetY: 440, w: 36, h: 65 },
    obstacles: [],
    coins: [],
    particles: [],
    activeFingers: [],
    lastSpawn: 0,
    lastFrame: 0,
    animationId: null,
    cameraStarting: false,
    handSeenAt: 0,
  });

  // UI States
  const [hudScore, setHudScore] = useState(0);
  const [hudTime, setHudTime] = useState(0);
  const [hudSpeed, setHudSpeed] = useState(100);
  const [hudStateInfo, setHudStateInfo] = useState({ label: 'Iniciando...', color: '#ffa502' });
  const [statusText, setStatusText] = useState('Cámara apagada');
  const [playerName, setPlayerName] = useState('Piloto 1');
  const [leaderboard, setLeaderboard] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayTitle, setOverlayTitle] = useState('¿Listo para conducir?');
  const [overlayText, setOverlayText] = useState('Ingresa tu nombre, activa la cámara y sobrevive esquivando obstáculos a velocidades extremas.');
  const [startBtnText, setStartBtnText] = useState('Activar cámara y correr');
  const [startBtnDisabled, setStartBtnDisabled] = useState(false);
  const [psychFeedback, setPsychFeedback] = useState(null);

  const W = 960;
  const H = 540;

  const loadLeaderboard = () => {
    try {
      const data = localStorage.getItem('finger_racer_records');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveRecord = (name, newScore) => {
    const cleanName = (name || '').trim() || 'Piloto 1';
    let records = loadLeaderboard();
    const existingIndex = records.findIndex((r) => r.name.toLowerCase() === cleanName.toLowerCase());

    if (existingIndex !== -1) {
      if (newScore > records[existingIndex].score) {
        records[existingIndex].score = newScore;
      }
    } else {
      records.push({ name: cleanName, score: newScore });
    }

    records.sort((a, b) => b.score - a.score);
    records = records.slice(0, 8);

    try {
      localStorage.setItem('finger_racer_records', JSON.stringify(records));
    } catch (e) {
      console.warn('No se pudo guardar récord', e);
    }
    setLeaderboard(records);
  };

  const getPsychologicalAssessment = (seconds) => {
    if (seconds < 30) {
      return {
        label: 'Poco Enfoque / Atención Dispersa',
        msg: 'Tu tiempo de respuesta fue bajo ante la aceleración. Trabaja en la concentración y precisión motora.',
        color: '#ff4757',
      };
    } else if (seconds >= 30 && seconds < 45) {
      return {
        label: 'Reflejos Promedio',
        msg: 'Buen nivel de reacción, aunque la alta velocidad progresiva afectó la anticipación.',
        color: '#ffa502',
      };
    } else if (seconds >= 45 && seconds < 75) {
      return {
        label: 'Gran Control Cognitivo',
        msg: 'Demuestras excelente adaptación a los cambios rápidos de velocidad y control bajo presión.',
        color: '#2ed573',
      };
    } else {
      return {
        label: 'Por Encima de la Media',
        msg: 'Tienes un nivel de reflejos, atención sostenida y velocidad de procesamiento extremo.',
        color: '#7c5cff',
      };
    }
  };

  const roundRect = (c, x, y, w, h, r, fill, stroke) => {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    if (fill) c.fill();
    if (stroke) c.stroke();
  };

  const createExplosion = (x, y, color) => {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.6,
        color,
      });
    }
  };

  const spawnEntities = () => {
    if (Math.random() < 0.6) {
      stateRef.current.obstacles.push({
        x: 120 + Math.random() * (W - 240),
        y: -50,
        w: 38,
        h: 38,
        type: Math.random() > 0.5 ? 'cone' : 'rock',
      });
    } else {
      stateRef.current.coins.push({
        x: 140 + Math.random() * (W - 280),
        y: -40,
        r: 14,
      });
    }
  };

  const endGame = () => {
    const s = stateRef.current;
    s.running = false;
    s.gameOver = true;
    saveRecord(playerName, s.score);

    const seconds = Math.floor(s.elapsedTime);
    const psych = getPsychologicalAssessment(seconds);

    setOverlayVisible(true);
    setOverlayTitle('¡Choque fatal!');
    setOverlayText(`Puntuación: ${s.score} pts | Tiempo de carrera: ${seconds} segundos.`);
    setPsychFeedback(psych);
    setStartBtnText('Volver a correr');
    setStatusText('Carrera terminada');
  };

  const resetGame = () => {
    const s = stateRef.current;
    s.score = 0;
    s.baseSpeed = 220;
    s.roadOffset = 0;
    s.elapsedTime = 0;
    s.startTime = performance.now();
    s.obstacles = [];
    s.coins = [];
    s.particles = [];
    s.car.x = W / 2;
    s.car.y = H - 100;
    s.car.targetX = W / 2;
    s.car.targetY = H - 100;

    setHudScore(0);
    setHudSpeed(100);
    setHudTime(0);
    setPsychFeedback(null);

    s.gameOver = false;
    s.running = false;
  };

  const onHandResults = (results) => {
    const s = stateRef.current;
    if (!results.multiHandLandmarks || !results.multiHandLandmarks.length) {
      if (performance.now() - s.handSeenAt > 250) {
        s.activeFingers = [];
      }
      return;
    }

    s.activeFingers = results.multiHandLandmarks.map((landmarks) => {
      const tip = landmarks[8];
      return { x: (1 - tip.x) * W, y: tip.y * H };
    });

    if (s.activeFingers.length > 0) {
      s.car.targetX = s.activeFingers[0].x;
      s.car.targetY = s.activeFingers[0].y;
    }

    s.handSeenAt = performance.now();
  };

  const startGame = async () => {
    const s = stateRef.current;
    if (s.cameraStarting) return;
    s.cameraStarting = true;
    setStartBtnDisabled(true);
    setStatusText('Iniciando cámara…');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acceso a cámara no disponible en este entorno.');
      }
      if (typeof window.Hands === 'undefined' || typeof window.Camera === 'undefined') {
        throw new Error('Librerías MediaPipe no cargadas.');
      }
      if (!s.hands) {
        s.hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        s.hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.6,
        });
        s.hands.onResults(onHandResults);
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
      }
      await s.camera.start();
      resetGame();
      s.running = true;
      s.gameOver = false;
      setOverlayVisible(false);
      setStatusText('Cámara activa · conduce con tu dedo');
    } catch (err) {
      console.error(err);
      setOverlayVisible(true);
      setOverlayTitle('Error de inicio');
      setOverlayText(err.message || 'Revisa permisos de cámara.');
      setStatusText('Error de cámara');
    } finally {
      s.cameraStarting = false;
      setStartBtnDisabled(false);
    }
  };

  // Main Drawing & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    setLeaderboard(loadLeaderboard());

    const drawRoad = (dt) => {
      s.roadOffset = (s.roadOffset + s.baseSpeed * dt) % 60;

      ctx.fillStyle = '#1b233a';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#ff4757';
      ctx.fillRect(80, 0, 16, H);
      ctx.fillRect(W - 96, 0, 16, H);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 6;
      ctx.setLineDash([30, 30]);
      ctx.lineDashOffset = -s.roadOffset;

      ctx.beginPath();
      ctx.moveTo(W * 0.35, 0);
      ctx.lineTo(W * 0.35, H);
      ctx.moveTo(W * 0.65, 0);
      ctx.lineTo(W * 0.65, H);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawPlayerCar = () => {
      ctx.save();
      ctx.translate(s.car.x, s.car.y);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-s.car.w / 2 + 3, -s.car.h / 2 + 3, s.car.w, s.car.h);

      ctx.fillStyle = '#ff4757';
      roundRect(ctx, -s.car.w / 2, -s.car.h / 2, s.car.w, s.car.h, 8, true, false);

      ctx.fillStyle = '#1e2746';
      roundRect(ctx, -s.car.w / 2 + 4, -s.car.h / 2 + 12, s.car.w - 8, 16, 4, true, false);

      ctx.fillStyle = '#ff6b81';
      ctx.fillRect(-s.car.w / 2 + 4, s.car.h / 2 - 4, 8, 4);
      ctx.fillRect(s.car.w / 2 - 12, s.car.h / 2 - 4, 8, 4);

      ctx.restore();
    };

    const drawObstacles = () => {
      for (const obs of s.obstacles) {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        if (obs.type === 'cone') {
          ctx.fillStyle = '#ffa502';
          ctx.beginPath();
          ctx.moveTo(0, -obs.h / 2);
          ctx.lineTo(obs.w / 2, obs.h / 2);
          ctx.lineTo(-obs.w / 2, obs.h / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#747d8c';
          ctx.beginPath();
          ctx.arc(0, 0, obs.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    const drawCoins = () => {
      for (const c of s.coins) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.fillStyle = '#eccc68';
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff7f50';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 0);
        ctx.restore();
      }
    };

    const drawHands = () => {
      if (!s.activeFingers.length) return;
      const age = performance.now() - s.handSeenAt;
      if (age > 700) return;

      for (const item of s.activeFingers) {
        const { x, y } = item;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawParticles = (dt) => {
      for (const p of s.particles) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      s.particles = s.particles.filter((p) => p.life > 0);
    };

    const draw = (now) => {
      const dt = s.lastFrame ? Math.min((now - s.lastFrame) / 1000, 0.04) : 0;
      s.lastFrame = now;

      ctx.clearRect(0, 0, W, H);
      drawRoad(dt);

      if (s.running && !s.gameOver) {
        s.elapsedTime = (now - s.startTime) / 1000;
        const currentSeconds = Math.floor(s.elapsedTime);
        setHudTime(currentSeconds);

        const currentAssessment = getPsychologicalAssessment(s.elapsedTime);
        setHudStateInfo(currentAssessment);

        // ACELERACIÓN PROGRESIVA DINÁMICA
        const currentAcceleration = 4 + s.elapsedTime * 0.5;
        s.baseSpeed += dt * currentAcceleration;

        s.score += Math.floor(dt * 10);
        setHudScore(s.score);
        setHudSpeed(Math.floor(s.baseSpeed / 2.2));

        s.car.x += (s.car.targetX - s.car.x) * 0.2;
        s.car.y += (s.car.targetY - s.car.y) * 0.2;

        s.car.x = Math.max(100, Math.min(W - 100, s.car.x));
        s.car.y = Math.max(40, Math.min(H - 40, s.car.y));

        if (now - s.lastSpawn > Math.max(250, 1100 - s.baseSpeed * 1.5)) {
          spawnEntities();
          s.lastSpawn = now;
        }

        for (const obs of s.obstacles) {
          obs.y += s.baseSpeed * dt;

          if (
            Math.abs(s.car.x - obs.x) < s.car.w / 2 + obs.w / 2 &&
            Math.abs(s.car.y - obs.y) < s.car.h / 2 + obs.h / 2
          ) {
            createExplosion(s.car.x, s.car.y, '#ff4757');
            endGame();
            break;
          }
        }

        for (let i = s.coins.length - 1; i >= 0; i--) {
          const c = s.coins[i];
          c.y += s.baseSpeed * dt;

          if (Math.hypot(s.car.x - c.x, s.car.y - c.y) < s.car.w / 2 + c.r) {
            s.score += 50;
            createExplosion(c.x, c.y, '#eccc68');
            s.coins.splice(i, 1);
          }
        }

        s.obstacles = s.obstacles.filter((o) => o.y < H + 50);
        s.coins = s.coins.filter((c) => c.y < H + 50);
      }

      drawObstacles();
      drawCoins();
      drawPlayerCar();
      drawParticles(dt);
      drawHands();

      s.animationId = requestAnimationFrame(draw);
    };

    s.animationId = requestAnimationFrame(draw);

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
      {/* Banner Original */}
      <header className="project-banner">
        <div className="banner-badge">UNIVERSIDAD COOPERATIVA DE COLOMBIA</div>
        <h1 className="banner-title">FINGER RACER · HAND TRACKING</h1>
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
        <div className="status-bar" id="status" aria-live="polite">
          <span>●</span> {statusText}
        </div>
        <button
          onClick={onReturnToMenu}
          className="nav-btn"
          style={{ background: 'rgba(255,255,255,0.08)', fontSize: '0.82rem' }}
        >
          ← Volver al Menú
        </button>
      </div>

      {/* HUD */}
      <section className="hud">
        <div className="stat">
          <small>Score</small>
          <strong>{hudScore}</strong>
        </div>
        <div className="stat">
          <small>Tiempo</small>
          <strong>{hudTime}s</strong>
        </div>
        <div className="stat">
          <small>Velocidad</small>
          <strong>{hudSpeed} km/h</strong>
        </div>
        <div className="mission">
          <div>
            <small>Evaluación de Reflejos</small>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: hudStateInfo.color }}>
              {hudStateInfo.label}
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout: Leaderboard & Stage */}
      <div className="main-layout">
        <aside className="leaderboard-panel">
          <h3>🏆 Récords Locales</h3>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Piloto</th>
                <th style={{ textAlign: 'right' }}>
                  Pts
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r, idx) => (
                <tr key={idx}>
                  <td className="rank">{idx + 1}</td>
                  <td className="name">{r.name}</td>
                  <td className="score">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 && <div className="empty-scores">Sin récords guardados.</div>}
        </aside>

        <main>
          <div className="stage">
            <video ref={videoRef} playsInline muted></video>
            <canvas ref={canvasRef} width={W} height={H} aria-label="Área de carreras"></canvas>

            <div className={`overlay ${overlayVisible ? '' : 'hidden'}`}>
              <div className="orb">🏎️</div>
              <h2>{overlayTitle}</h2>
              <p>{overlayText}</p>

              {psychFeedback && (
                <div
                  className="psych-badge"
                  style={{
                    borderColor: psychFeedback.color,
                    color: psychFeedback.color,
                  }}
                >
                  <strong>Análisis Psicológico: {psychFeedback.label}</strong>
                  <br />
                  <span style={{ fontSize: '0.82rem', fontWeight: 'normal', color: '#c1cbe5' }}>
                    {psychFeedback.msg}
                  </span>
                </div>
              )}

              <div className="player-input-group">
                <label htmlFor="playerName">Nombre de Piloto</label>
                <input
                  type="text"
                  id="playerName"
                  placeholder="Piloto 1"
                  maxLength={15}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              <button className="game-btn" onClick={startGame} disabled={startBtnDisabled}>
                {startBtnText}
              </button>
            </div>
          </div>

          <div className="controls">
            <div className="hint">
              <b>Cómo jugar:</b> Mueve la yema del índice para controlar el vehículo · Esquiva los conos/rocas 🪨 y toma las
              monedas ⭐.
            </div>
            <button
              className="game-btn game-btn-secondary"
              onClick={() => {
                resetGame();
                setOverlayVisible(true);
                setOverlayTitle('Carrera Reiniciada');
                setStartBtnText('Comenzar carrera');
              }}
            >
              Reiniciar carrera
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
