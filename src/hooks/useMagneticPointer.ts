import { useCallback } from 'react';

export default function useMagneticPointer<T extends HTMLElement>(
  enabled = true,
  strength = 0.16
) {
  const onPointerMove = useCallback<React.PointerEventHandler<T>>(
    (event) => {
      if (!enabled || event.pointerType !== 'mouse') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left - bounds.width / 2) * strength;
      const offsetY = (event.clientY - bounds.top - bounds.height / 2) * strength;
      event.currentTarget.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
    },
    [enabled, strength]
  );

  const onPointerLeave = useCallback<React.PointerEventHandler<T>>(
    (event) => {
      if (enabled) event.currentTarget.style.transform = '';
    },
    [enabled]
  );

  return { onPointerMove, onPointerLeave };
}
