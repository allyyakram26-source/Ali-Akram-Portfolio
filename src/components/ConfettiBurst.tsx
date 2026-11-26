import { useEffect, useRef } from 'react';

export type ConfettiOrigin = {
  x: number;
  y: number;
};

type ConfettiBurstProps = {
  burstKey: number;
  origin: ConfettiOrigin | null;
  reducedMotion: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
};

const CONFETTI_COLORS = ['#22D3EE', '#818CF8', '#34D399', '#FBBF24', '#F472B6'];

export default function ConfettiBurst({ burstKey, origin, reducedMotion }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !origin || burstKey === 0 || reducedMotion) return undefined;

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const particles: Particle[] = Array.from({ length: 48 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.2 + Math.random() * 5.2;
      return {
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        width: 3 + Math.random() * 4,
        height: 5 + Math.random() * 6,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.22,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      };
    });

    const startedAt = performance.now();
    let frameId = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 1350, 1);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.105;
        particle.rotation += particle.rotationSpeed;

        context.save();
        context.globalAlpha = progress > 0.68 ? (1 - progress) / 0.32 : 1;
        context.fillStyle = particle.color;
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
        context.restore();
      });

      if (progress < 1) frameId = requestAnimationFrame(animate);
      else context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [burstKey, origin, reducedMotion]);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
