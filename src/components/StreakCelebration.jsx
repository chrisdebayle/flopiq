import { useEffect, useRef, useState } from 'react';

const PARTICLE_COLORS = [
  '#ffd700', '#ff6b00', '#ff1744', '#ffffff', '#ffab00',
  '#e040fb', '#00e5ff', '#76ff03', '#ff9100',
];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function StreakCelebration({ milestone, onComplete }) {
  const canvasRef = useRef(null);
  const [text, setText] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Create particles — Vegas firework sparkle bursts
    const particles = [];
    const numBursts = milestone >= 20 ? 5 : milestone >= 10 ? 4 : 3;
    const particlesPerBurst = milestone >= 20 ? 30 : milestone >= 10 ? 22 : 16;

    for (let b = 0; b < numBursts; b++) {
      const cx = randomBetween(W * 0.2, W * 0.8);
      const cy = randomBetween(H * 0.15, H * 0.5);
      for (let i = 0; i < particlesPerBurst; i++) {
        const angle = (Math.PI * 2 * i) / particlesPerBurst + randomBetween(-0.3, 0.3);
        const speed = randomBetween(2, 7);
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - randomBetween(0.5, 2),
          radius: randomBetween(1.5, 4),
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          life: 1,
          decay: randomBetween(0.008, 0.02),
          gravity: 0.04,
          sparkle: Math.random() > 0.6,
          sparklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Trailing sparkle particles (secondary)
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: randomBetween(0, W),
        y: randomBetween(0, H * 0.7),
        vx: randomBetween(-0.5, 0.5),
        vy: randomBetween(-1, 0.5),
        radius: randomBetween(0.5, 2),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        life: randomBetween(0.3, 1),
        decay: randomBetween(0.005, 0.015),
        gravity: 0.01,
        sparkle: true,
        sparklePhase: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      frame++;

      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.life -= p.decay;

        const alpha = Math.max(0, p.life);
        const r = p.sparkle
          ? p.radius * (0.5 + 0.5 * Math.sin(frame * 0.3 + p.sparklePhase))
          : p.radius * alpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Glow effect
        if (alpha > 0.4 && r > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha * 0.15;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      if (alive) {
        animId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animId = requestAnimationFrame(animate);

    // Fade text after 1.2s
    const textTimer = setTimeout(() => setText(false), 1200);
    // Force cleanup after 3s
    const forceEnd = setTimeout(() => { cancelAnimationFrame(animId); onComplete?.(); }, 3000);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(textTimer);
      clearTimeout(forceEnd);
    };
  }, [milestone, onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none',
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {text && (
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          animation: 'streakTextIn 0.4s ease-out',
        }}>
          <div style={{
            fontSize: 52, fontWeight: 900, color: '#ffd700',
            textShadow: '0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,140,0,0.3)',
            letterSpacing: 2,
          }}>
            {milestone}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: '#fff',
            textShadow: '0 0 20px rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: 4, marginTop: 4,
          }}>
            Streak
          </div>
        </div>
      )}
      <style>{`
        @keyframes streakTextIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          60% { transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
