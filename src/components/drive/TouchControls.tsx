import type { PointerEvent } from 'react';
import type { DriveMovement } from '../../hooks/useCarControls';

type TouchControlsProps = {
  onDirectionChange: (direction: keyof DriveMovement, pressed: boolean) => void;
  onHonk: () => void;
  onReleaseHorn: () => void;
  hornPressed: boolean;
  muted: boolean;
};

function holdHandlers(
  direction: keyof DriveMovement,
  onDirectionChange: TouchControlsProps['onDirectionChange']
) {
  const release = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onDirectionChange(direction, false);
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      onDirectionChange(direction, true);
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: () => onDirectionChange(direction, false),
  };
}

export default function TouchControls({
  onDirectionChange,
  onHonk,
  onReleaseHorn,
  hornPressed,
  muted,
}: TouchControlsProps) {
  return (
    <div className="drive-touch-controls" aria-label="Driving controls">
      <button
        type="button"
        aria-label="Brake and drive left"
        aria-keyshortcuts="ArrowLeft A"
        {...holdHandlers('left', onDirectionChange)}
      >
        <span aria-hidden="true">←</span>
        <small>Brake</small>
      </button>
      <button
        type="button"
        aria-label="Accelerate and drive right"
        aria-keyshortcuts="ArrowRight D"
        {...holdHandlers('right', onDirectionChange)}
      >
        <span aria-hidden="true">→</span>
        <small>Drive</small>
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
