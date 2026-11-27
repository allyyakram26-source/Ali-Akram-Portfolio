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
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  const engineContextRef = useRef<AudioContext | null>(null);
  const engineOscillatorRef = useRef<OscillatorNode | null>(null);
  const engineFilterRef = useRef<BiquadFilterNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const engineSpeedRef = useRef(0);
  const engineBoostingRef = useRef(false);

  const updateEngineSound = useCallback((speed: number, boosting: boolean) => {
    engineSpeedRef.current = speed;
    engineBoostingRef.current = boosting;

    const context = engineContextRef.current;
    const oscillator = engineOscillatorRef.current;
    const filter = engineFilterRef.current;
    const gain = engineGainRef.current;
    if (!context || !oscillator || !filter || !gain) return;

    const speedRatio = Math.min(Math.abs(speed) / 12.5, 1);
    const now = context.currentTime;
    oscillator.frequency.setTargetAtTime(48 + speedRatio * 116, now, 0.12);
    filter.frequency.setTargetAtTime(300 + speedRatio * 900, now, 0.12);
    const volume = mutedRef.current || speedRatio < 0.01
      ? 0.0001
      : 0.014 + speedRatio * 0.026 + (boosting ? 0.008 : 0);
    gain.gain.setTargetAtTime(volume, now, 0.12);
  }, []);

  const activateEngineAudio = useCallback(() => {
    if (mutedRef.current || typeof window.AudioContext === 'undefined') return;

    let context = engineContextRef.current;
    if (!context) {
      context = new window.AudioContext();
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 48;
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.7;
      gain.gain.value = 0.0001;
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      engineContextRef.current = context;
      engineOscillatorRef.current = oscillator;
      engineFilterRef.current = filter;
      engineGainRef.current = gain;
    }

    if (context.state === 'suspended') {
      void context.resume().catch((error: unknown) => {
        console.warn('Unable to resume drive audio:', error);
      });
    }
    updateEngineSound(engineSpeedRef.current, engineBoostingRef.current);
  }, [updateEngineSound]);

  const toggleMuted = useCallback(() => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);
    if (nextMuted) {
      updateEngineSound(engineSpeedRef.current, engineBoostingRef.current);
    } else {
      activateEngineAudio();
    }
  }, [activateEngineAudio, updateEngineSound]);

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
      if (pressed && (control === 'left' || control === 'right' || control === 'boost')) {
        activateEngineAudio();
      }
      if (control === 'boost') {
        setBoostPressed(keyboardRef.current.boost || pressed);
      } else if (control === 'jump') {
        setJumpPressed(keyboardRef.current.jump || pressed);
      }
    },
    [activateEngineAudio, syncMovement]
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
        activateEngineAudio();
        keyboardRef.current.left = true;
        syncMovement();
      } else if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        activateEngineAudio();
        keyboardRef.current.right = true;
        syncMovement();
      } else if (key === 'shift') {
        event.preventDefault();
        activateEngineAudio();
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

    const onVisibilityChange = () => {
      releaseAll();
      const context = engineContextRef.current;
      if (document.visibilityState === 'hidden' && context?.state === 'running') {
        void context.suspend().catch((error: unknown) => {
          console.warn('Unable to pause drive audio:', error);
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      releaseAll();
    };
  }, [activateEngineAudio, enabled, honk, releaseHorn, syncMovement]);

  useEffect(() => () => {
    const context = engineContextRef.current;
    if (!context) return;
    engineOscillatorRef.current?.stop();
    void context.close();
    engineContextRef.current = null;
    engineOscillatorRef.current = null;
    engineFilterRef.current = null;
    engineGainRef.current = null;
  }, []);

  return {
    movementRef,
    hornPressed,
    boostPressed,
    jumpPressed,
    muted,
    toggleMuted,
    updateEngineSound,
    setTouchControl,
    honk,
    releaseHorn,
  };
}
