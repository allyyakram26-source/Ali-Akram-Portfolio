import { useCallback, useEffect, useRef } from 'react';

export default function useSpotlightPointer(enabled = true) {
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const pointRef = useRef({ x: '50%', y: '50%' });
  const hasFinePointerRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updatePointerSupport = () => {
      hasFinePointerRef.current = mediaQuery.matches;
    };
    updatePointerSupport();
    mediaQuery.addEventListener('change', updatePointerSupport);

    return () => {
      mediaQuery.removeEventListener('change', updatePointerSupport);
      hasFinePointerRef.current = false;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  const onPointerMove = useCallback<React.PointerEventHandler<HTMLElement>>(
    (event) => {
      if (!enabled || !hasFinePointerRef.current || event.pointerType !== 'mouse') return;

      const element = event.currentTarget;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      targetRef.current = element;
      pointRef.current = {
        x: `${event.clientX - bounds.left}px`,
        y: `${event.clientY - bounds.top}px`,
      };

      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        const target = targetRef.current;
        if (target) {
          target.style.setProperty('--mx', pointRef.current.x);
          target.style.setProperty('--my', pointRef.current.y);
        }
        frameRef.current = null;
      });
    },
    [enabled]
  );

  const onPointerLeave = useCallback<React.PointerEventHandler<HTMLElement>>((event) => {
    event.currentTarget.style.setProperty('--mx', '50%');
    event.currentTarget.style.setProperty('--my', '50%');
  }, []);

  return { onPointerMove, onPointerLeave };
}
