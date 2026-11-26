import type { ReactNode } from 'react';
import useTiltEffect from '../hooks/useTiltEffect';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  reducedMotion?: boolean;
};

export default function TiltCard({ children, className = '', reducedMotion = false }: TiltCardProps) {
  const { cardRef, onPointerMove, onPointerLeave } = useTiltEffect(!reducedMotion);

  return (
    <div
      className={`tilt-card-shell animated-border-shell ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span className="animated-border-spinner" aria-hidden="true" />
      <div ref={cardRef} className="tilt-card-inner animated-border-content">
        {children}
        <span className="tilt-card-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
