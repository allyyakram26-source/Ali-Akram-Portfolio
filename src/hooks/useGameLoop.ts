import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import type { DriveMovement } from './useCarControls';
import { DRIVE_WORLD_WIDTH, getDriveRoadSurfaceY } from '../components/drive/roadGeometry';
import type { DrivePickup } from '../components/drive/pickups';

export { DRIVE_WORLD_WIDTH } from '../components/drive/roadGeometry';

export type DriveStationPosition = {
  id: string;
  worldPosition: number;
};

type UseGameLoopOptions = {
  enabled: boolean;
  movementRef: MutableRefObject<DriveMovement>;
  worldRef: RefObject<HTMLDivElement>;
  farLayerRef: RefObject<HTMLDivElement>;
  middleLayerRef: RefObject<HTMLDivElement>;
  nearLayerRef: RefObject<HTMLDivElement>;
  carRef: RefObject<HTMLDivElement>;
  stations: readonly DriveStationPosition[];
  visitedStations: ReadonlySet<string>;
  pickups: readonly DrivePickup[];
  collectedPickups: ReadonlySet<string>;
  onStationApproach?: (stationId: string) => void;
  onPickup?: (pickupId: string) => void;
};

function setTransform(element: HTMLDivElement | null, value: string) {
  if (element) element.style.transform = value;
}

export default function useGameLoop({
  enabled,
  movementRef,
  worldRef,
  farLayerRef,
  middleLayerRef,
  nearLayerRef,
  carRef,
  stations,
  visitedStations,
  pickups,
  collectedPickups,
  onStationApproach,
  onPickup,
}: UseGameLoopOptions) {
  const worldPositionRef = useRef(0);
  const speedRef = useRef(0);
  const boostFuelRef = useRef(100);
  const openedStationsRef = useRef(new Set<string>());
  const collectedPickupsRef = useRef(new Set<string>());
  const [metrics, setMetrics] = useState({
    worldPosition: 0,
    speed: 0,
    boostFuel: 100,
    boosting: false,
  });

  const jumpTo = useCallback(
    (stationWorldPosition: number) => {
      const carAnchor = window.innerWidth * 0.2;
      const maxOffset = Math.max(DRIVE_WORLD_WIDTH - window.innerWidth, 0);
      const position = Math.min(Math.max(stationWorldPosition - carAnchor, 0), maxOffset);
      worldPositionRef.current = position;
      speedRef.current = 0;
      setTransform(worldRef.current, `translate3d(${-position}px, 0, 0)`);
      setTransform(farLayerRef.current, `translate3d(${-position * 0.12}px, 0, 0)`);
      setTransform(middleLayerRef.current, `translate3d(${-position * 0.24}px, 0, 0)`);
      setTransform(nearLayerRef.current, `translate3d(${-position * 0.4}px, 0, 0)`);
      carRef.current?.style.setProperty(
        '--road-surface-y',
        `${getDriveRoadSurfaceY(position + carAnchor)}%`
      );
      if (carRef.current) carRef.current.dataset.boosting = 'false';
      setMetrics({
        worldPosition: Math.round(position),
        speed: 0,
        boostFuel: boostFuelRef.current,
        boosting: false,
      });
    },
    [carRef, farLayerRef, middleLayerRef, nearLayerRef, worldRef]
  );

  useEffect(() => {
    if (!enabled) {
      speedRef.current = 0;
      setMetrics((current) => ({ ...current, speed: 0, boosting: false }));
      if (carRef.current) {
        carRef.current.dataset.moving = 'false';
        carRef.current.dataset.boosting = 'false';
        carRef.current.dataset.airborne = 'false';
        carRef.current.style.setProperty('--truck-jump-y', '0px');
        carRef.current.style.setProperty('--truck-shadow-offset', '0px');
      }
      return undefined;
    }

    let frameId = 0;
    let lastFrameTime = 0;
    let lastMetricsTime = 0;
    let lastWheelDuration = '';
    let jumpStartedAt: number | null = null;
    let jumpWasPressed = false;

    const renderFrame = (now: number) => {
      if (document.visibilityState === 'hidden') {
        frameId = 0;
        lastFrameTime = 0;
        return;
      }

      const deltaFrames = lastFrameTime
        ? Math.min((now - lastFrameTime) / (1000 / 60), 2.5)
        : 1;
      lastFrameTime = now;

      const movement = movementRef.current;
      const direction = Number(movement.right) - Number(movement.left);
      const requestingBoost = movement.boost && direction > 0;
      if (requestingBoost && boostFuelRef.current > 0) {
        boostFuelRef.current = Math.max(0, boostFuelRef.current - 0.36 * deltaFrames);
      } else if (!requestingBoost) {
        boostFuelRef.current = Math.min(100, boostFuelRef.current + 0.16 * deltaFrames);
      }
      const boosting = requestingBoost && boostFuelRef.current > 0;
      const targetSpeed = direction > 0 ? (boosting ? 12.5 : 7.2) : direction < 0 ? -4.8 : 0;
      const easing = 1 - Math.pow(0.84, deltaFrames);
      speedRef.current += (targetSpeed - speedRef.current) * easing;

      if (movement.jump && !jumpWasPressed && Math.abs(speedRef.current) > 1.2) {
        jumpStartedAt = now;
      }
      jumpWasPressed = movement.jump;

      let jumpHeight = 0;
      let jumpProgress = 1;
      if (jumpStartedAt !== null) {
        jumpProgress = (now - jumpStartedAt) / 760;
        if (jumpProgress >= 1) {
          jumpStartedAt = null;
        } else {
          jumpHeight = Math.sin(Math.PI * jumpProgress) * 70;
        }
      }

      const maxOffset = Math.max(DRIVE_WORLD_WIDTH - window.innerWidth, 0);
      worldPositionRef.current = Math.min(
        Math.max(worldPositionRef.current + speedRef.current * deltaFrames, 0),
        maxOffset
      );

      const position = worldPositionRef.current;
      const speed = speedRef.current;
      setTransform(worldRef.current, `translate3d(${-position}px, 0, 0)`);
      setTransform(farLayerRef.current, `translate3d(${-position * 0.12}px, 0, 0)`);
      setTransform(middleLayerRef.current, `translate3d(${-position * 0.24}px, 0, 0)`);
      setTransform(nearLayerRef.current, `translate3d(${-position * 0.4}px, 0, 0)`);

      const car = carRef.current;
      if (car) {
        const carAnchor = window.innerWidth * 0.2;
        car.style.setProperty(
          '--road-surface-y',
          `${getDriveRoadSurfaceY(position + carAnchor)}%`
        );
        const driveTilt = direction > 0 ? -2.5 : direction < 0 ? 3 : 0;
        const jumpTilt = jumpHeight > 0 ? (jumpProgress < 0.5 ? -7 : 5) : 0;
        const shadowScale = 1 - (jumpHeight / 70) * 0.38;
        car.style.setProperty('--car-tilt', `${driveTilt + jumpTilt}deg`);
        car.style.setProperty('--truck-jump-y', `${-jumpHeight}px`);
        car.style.setProperty('--truck-shadow-offset', `${jumpHeight}px`);
        car.style.setProperty('--truck-shadow-scale', String(shadowScale));
        car.style.setProperty('--truck-shadow-opacity', String(0.3 - (jumpHeight / 70) * 0.18));
        car.dataset.moving = String(Math.abs(speed) > 0.15);
        car.dataset.boosting = String(boosting);
        car.dataset.airborne = String(jumpHeight > 0);
        const wheelDuration = `${Math.max(0.16, 0.72 - Math.abs(speed) * 0.075).toFixed(2)}s`;
        if (wheelDuration !== lastWheelDuration) {
          car.style.setProperty('--wheel-duration', wheelDuration);
          lastWheelDuration = wheelDuration;
        }
      }

      const carAnchor = window.innerWidth * 0.2;
      for (const station of stations) {
        const distance = station.worldPosition - position - carAnchor;
        if (
          Math.abs(distance) < 82 &&
          !openedStationsRef.current.has(station.id) &&
          !visitedStations.has(station.id)
        ) {
          openedStationsRef.current.add(station.id);
          onStationApproach?.(station.id);
          break;
        }
      }

      for (const pickup of pickups) {
        const distance = pickup.worldPosition - position - carAnchor;
        if (
          Math.abs(distance) < 54 &&
          !collectedPickups.has(pickup.id) &&
          !collectedPickupsRef.current.has(pickup.id)
        ) {
          collectedPickupsRef.current.add(pickup.id);
          boostFuelRef.current = Math.min(100, boostFuelRef.current + 25);
          onPickup?.(pickup.id);
          break;
        }
      }

      if (now - lastMetricsTime > 100) {
        setMetrics({
          worldPosition: Math.round(position),
          speed: Math.round(speed * 10) / 10,
          boostFuel: Math.round(boostFuelRef.current),
          boosting,
        });
        lastMetricsTime = now;
      }

      frameId = requestAnimationFrame(renderFrame);
    };

    const startLoop = () => {
      if (!frameId && document.visibilityState === 'visible') {
        lastFrameTime = 0;
        frameId = requestAnimationFrame(renderFrame);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        lastFrameTime = 0;
      } else {
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    startLoop();
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [
    carRef,
    enabled,
    farLayerRef,
    middleLayerRef,
    movementRef,
    nearLayerRef,
    onStationApproach,
    onPickup,
    pickups,
    stations,
    visitedStations,
    collectedPickups,
    worldRef,
  ]);

  return { ...metrics, jumpTo };
}
