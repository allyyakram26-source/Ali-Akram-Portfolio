import type { PointerEvent } from 'react';
import type { DriveMovement } from '../../hooks/useCarControls';

type TouchControlsProps = {
  onControlChange: (control: keyof DriveMovement, pressed: boolean) => void;
  onHonk: () => void;
  onReleaseHorn: () => void;
  hornPressed: boolean;
  jumpPressed: boolean;
  muted: boolean;
};

function holdHandlers(
  direction: keyof DriveMovement,
  onControlChange: TouchControlsProps['onControlChange']
) {
  const release = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onControlChange(direction, false);
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      onControlChange(direction, true);
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: () => onControlChange(direction, false),
  };
}

export default function TouchControls({
  onControlChange,
  onHonk,
  onReleaseHorn,
  hornPressed,
  jumpPressed,
  muted,
}: TouchControlsProps) {
  return (
    <div className="drive-touch-controls" aria-label="Driving controls">
      <button
        type="button"
        aria-label="Brake and drive left"
        aria-keyshortcuts="ArrowLeft A"
        {...holdHandlers('left', onControlChange)}
      >
        <span aria-hidden="true">←</span>
        <small>Brake</small>
      </button>
      <button
        type="button"
        aria-label="Accelerate and drive right"
        aria-keyshortcuts="ArrowRight D"
        {...holdHandlers('right', onControlChange)}
      >
        <span aria-hidden="true">→</span>
        <small>Drive</small>
      </button>
      <button
        type="button"
        className={`drive-jump-button ${jumpPressed ? 'is-pressed' : ''}`}
        aria-label="Hold to perform a monster truck jump"
        aria-keyshortcuts="ArrowUp W"
        aria-pressed={jumpPressed}
        {...holdHandlers('jump', onControlChange)}
      >
        <span aria-hidden="true">↑</span>
        <small>Jump</small>
      </button>
      <button
        type="button"
        className={`drive-horn-button ${hornPressed ? 'is-pressed' : ''}`}
        aria-label={muted ? 'Horn sound is muted' : 'Honk horn'}
        aria-pressed={hornPressed}
        onPointerDown={(event) => {
          event.preventDefault();
          onHonk();
        }}
        onPointerUp={onReleaseHorn}
        onPointerCancel={onReleaseHorn}
        onPointerLeave={onReleaseHorn}
      >
        <span aria-hidden="true">♫</span>
        <small>Horn</small>
      </button>
    </div>
  );
}
