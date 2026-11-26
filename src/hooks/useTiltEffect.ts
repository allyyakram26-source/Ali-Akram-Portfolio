import { useCallback, useEffect, useRef } from 'react';

export default function useTiltEffect(enabled = true, maxAngle = 7) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasFinePointer = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.matchMedia) {
      hasFinePointer.current = false;
      return undefined;
    }

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updatePointerSupport = () => {
      hasFinePointer.current = mediaQuery.matches;
    };
    updatePointerSupport();
    mediaQuery.addEventListener('change', updatePointerSupport);

    return () => {
      mediaQuery.removeEventListener('change', updatePointerSupport);
      hasFinePointer.current = false;
      if (cardRef.current) cardRef.current.style.transform = '';
    };
  }, [enabled]);

  const onPointerMove = useCallback<React.PointerEventHandler<HTMLDivElement>>(
    (event) => {
      const card = cardRef.current;
      if (!enabled || !hasFinePointer.current || event.pointerType !== 'mouse' || !card) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);
      const rotateX = (0.5 - y) * maxAngle;
      const rotateY = (x - 0.5) * maxAngle;

      card.style.setProperty('--tilt-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--tilt-y', `${event.clientY - bounds.top}px`);
      card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    },
    [enabled, maxAngle]
  );

  const onPointerLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = '';
  }, []);

  return { cardRef, onPointerMove, onPointerLeave };
}
