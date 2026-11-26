import { useCallback, useEffect, useRef, useState } from 'react';

export type DriveMovement = {
  left: boolean;
  right: boolean;
  boost: boolean;
  jump: boolean;
};

export default function useCarControls(enabled: boolean) {
  const movementRef = useRef<DriveMovement>({ left: false, right: false, boost: false, jump: false });
  const keyboardRef = useRef<DriveMovement>({ left: false, right: false, boost: false, jump: false });
  const touchRef = useRef<DriveMovement>({ left: false, right: false, boost: false, jump: false });
  const [hornPressed, setHornPressed] = useState(false);
  const [boostPressed, setBoostPressed] = useState(false);
  const [jumpPressed, setJumpPressed] = useState(false);
  const [muted, setMuted] = useState(true);

  const syncMovement = useCallback(() => {
    movementRef.current = {
      left: keyboardRef.current.left || touchRef.current.left,
      right: keyboardRef.current.right || touchRef.current.right,
      boost: keyboardRef.current.boost || touchRef.current.boost,
      jump: keyboardRef.current.jump || touchRef.current.jump,
    };
  }, []);

  const setTouchControl = useCallback(
    (control: keyof DriveMovement, pressed: boolean) => {
      touchRef.current[control] = pressed;
      syncMovement();
      if (control === 'boost') {
        setBoostPressed(keyboardRef.current.boost || pressed);
      } else if (control === 'jump') {
        setJumpPressed(keyboardRef.current.jump || pressed);
      }
    },
    [syncMovement]
  );

  const playHorn = useCallback(() => {
    if (muted || typeof window.AudioContext === 'undefined') return;

    const context = new window.AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 392;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = () => {
      void context.close();
    };
    oscillator.start();
    oscillator.stop(context.currentTime + 0.19);
  }, [muted]);

  const honk = useCallback(() => {
    setHornPressed(true);
    playHorn();
  }, [playHorn]);

  const releaseHorn = useCallback(() => {
    setHornPressed(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      keyboardRef.current = { left: false, right: false, boost: false, jump: false };
      touchRef.current = { left: false, right: false, boost: false, jump: false };
      movementRef.current = { left: false, right: false, boost: false, jump: false };
      setHornPressed(false);
      setBoostPressed(false);
      setJumpPressed(false);
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select'))
      ) return;

      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        keyboardRef.current.left = true;
        syncMovement();
      } else if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        keyboardRef.current.right = true;
        syncMovement();
      } else if (key === 'shift') {
        event.preventDefault();
        keyboardRef.current.boost = true;
        syncMovement();
        setBoostPressed(true);
      } else if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        keyboardRef.current.jump = true;
        syncMovement();
        setJumpPressed(true);
      } else if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat) honk();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        keyboardRef.current.left = false;
        syncMovement();
      } else if (key === 'arrowright' || key === 'd') {
        keyboardRef.current.right = false;
        syncMovement();
      } else if (key === 'shift') {
        keyboardRef.current.boost = false;
        syncMovement();
        setBoostPressed(touchRef.current.boost);
      } else if (key === 'arrowup' || key === 'w') {
        keyboardRef.current.jump = false;
        syncMovement();
        setJumpPressed(touchRef.current.jump);
      } else if (event.code === 'Space') {
        releaseHorn();
      }
    };

    const releaseAll = () => {
      keyboardRef.current = { left: false, right: false, boost: false, jump: false };
      touchRef.current = { left: false, right: false, boost: false, jump: false };
      syncMovement();
      releaseHorn();
      setBoostPressed(false);
      setJumpPressed(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', releaseAll);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', releaseAll);
      releaseAll();
    };
  }, [enabled, honk, releaseHorn, syncMovement]);

  return {
    movementRef,
    hornPressed,
    boostPressed,
    jumpPressed,
    muted,
    setMuted,
    setTouchControl,
    honk,
    releaseHorn,
  };
}
