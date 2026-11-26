import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import type { DriveMovement } from './useCarControls';
import { DRIVE_WORLD_WIDTH, getDriveRoadSurfaceY } from '../components/drive/roadGeometry';

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
  onStationApproach?: (stationId: string) => void;
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
  onStationApproach,
}: UseGameLoopOptions) {
  const worldPositionRef = useRef(0);
  const speedRef = useRef(0);
  const openedStationsRef = useRef(new Set<string>());
  const [metrics, setMetrics] = useState({ worldPosition: 0, speed: 0 });

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
      setMetrics({ worldPosition: Math.round(position), speed: 0 });
    },
    [carRef, farLayerRef, middleLayerRef, nearLayerRef, worldRef]
  );

  useEffect(() => {
    if (!enabled) {
      speedRef.current = 0;
      setMetrics((current) => ({ ...current, speed: 0 }));
      if (carRef.current) carRef.current.dataset.moving = 'false';
      return undefined;
    }

    let frameId = 0;
    let lastFrameTime = 0;
    let lastMetricsTime = 0;
    let lastWheelDuration = '';

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
      const targetSpeed = direction > 0 ? 7.2 : direction < 0 ? -4.8 : 0;
      const easing = 1 - Math.pow(0.84, deltaFrames);
      speedRef.current += (targetSpeed - speedRef.current) * easing;

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
        const tilt = direction > 0 ? -2.5 : direction < 0 ? 3 : 0;
        car.style.setProperty('--car-tilt', `${tilt}deg`);
        car.dataset.moving = String(Math.abs(speed) > 0.15);
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

      if (now - lastMetricsTime > 100) {
        setMetrics({ worldPosition: Math.round(position), speed: Math.round(speed * 10) / 10 });
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
    stations,
    visitedStations,
    worldRef,
  ]);

  return { ...metrics, jumpTo };
}
