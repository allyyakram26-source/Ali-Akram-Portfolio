import type { ReactNode, RefObject } from 'react';
import ParallaxLayer from './ParallaxLayer';
import { DRIVE_WORLD_WIDTH } from '../../hooks/useGameLoop';

type RoadProps = {
  isDark: boolean;
  children?: ReactNode;
  worldRef: RefObject<HTMLDivElement>;
  farLayerRef: RefObject<HTMLDivElement>;
  middleLayerRef: RefObject<HTMLDivElement>;
  nearLayerRef: RefObject<HTMLDivElement>;
  roadMarksRef: RefObject<HTMLDivElement>;
};

export default function Road({
  isDark,
  children,
  worldRef,
  farLayerRef,
  middleLayerRef,
  nearLayerRef,
  roadMarksRef,
}: RoadProps) {
  return (
    <div className="drive-scene" data-theme={isDark ? 'night' : 'day'} aria-label="Drive Mode road scene">
      <div className="drive-sky" aria-hidden="true" />
      <ParallaxLayer ref={farLayerRef} layer="far" />
      <ParallaxLayer ref={middleLayerRef} layer="middle" />
      <ParallaxLayer ref={nearLayerRef} layer="near" />
      <div
        ref={worldRef}
        className="drive-world"
        style={{ width: `${DRIVE_WORLD_WIDTH}px` }}
      >
        {children}
      </div>
      <div className="drive-road" aria-hidden="true">
        <div ref={roadMarksRef} className="drive-road-marks" />
      </div>
    </div>
  );
}
