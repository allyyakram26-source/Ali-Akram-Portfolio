import type { PointerEventHandler, ReactNode } from 'react';

type AnimatedBorderProps = {
  children: ReactNode;
  className?: string;
  onPointerMove?: PointerEventHandler<HTMLSpanElement>;
  onPointerLeave?: PointerEventHandler<HTMLSpanElement>;
};

export default function AnimatedBorder({
  children,
  className = '',
  onPointerMove,
  onPointerLeave,
}: AnimatedBorderProps) {
  return (
    <span
      className={`animated-border-shell ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span className="animated-border-spinner" aria-hidden="true" />
      <span className="animated-border-content">{children}</span>
    </span>
  );
}
