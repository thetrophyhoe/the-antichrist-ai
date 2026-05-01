import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const INDIGO = '#4B0082';
const PLATINUM = '#E5E4E2';

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  sides: number, radius: number, rotation: number,
  color: string, alpha: number, lineWidth = 1
) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i + rotation;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export default function GeometricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let rotation = 0;

    const particles: Particle[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      rotation += 0.0018;

      ctx.shadowBlur = 12;
      ctx.shadowColor = INDIGO;

      drawPolygon(ctx, cx, cy, 6, Math.min(W, H) * 0.42, -rotation * 0.55, PLATINUM, 0.06);
      drawPolygon(ctx, cx, cy, 6, Math.min(W, H) * 0.35, rotation * 0.7, INDIGO, 0.18);
      drawPolygon(ctx, cx, cy, 6, Math.min(W, H) * 0.26, -rotation * 1.1, INDIGO, 0.28);
      drawPolygon(ctx, cx, cy, 3, Math.min(W, H) * 0.38, rotation * 1.4, PLATINUM, 0.1);
      drawPolygon(ctx, cx, cy, 3, Math.min(W, H) * 0.28, -rotation * 1.6, INDIGO, 0.22);
      drawPolygon(ctx, cx, cy, 8, Math.min(W, H) * 0.18, rotation * 2, PLATINUM, 0.12);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation * 0.5);
      const lineLen = Math.min(W, H) * 0.48;
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = PLATINUM;
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * lineLen, Math.sin(a) * lineLen);
        ctx.lineTo(-Math.cos(a) * lineLen, -Math.sin(a) * lineLen);
        ctx.stroke();
      }
      ctx.restore();

      ctx.shadowBlur = 4;
      ctx.shadowColor = INDIGO;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const alpha = (1 - dist / 220) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = INDIGO;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = PLATINUM;
        ctx.globalAlpha = 0.35;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
