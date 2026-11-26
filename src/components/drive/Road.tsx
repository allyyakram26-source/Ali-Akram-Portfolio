import type { ReactNode, RefObject } from 'react';
import ParallaxLayer from './ParallaxLayer';
import { DRIVE_WORLD_WIDTH } from '../../hooks/useGameLoop';
import {
  DRIVE_ROAD_CENTER_PATH,
  DRIVE_ROAD_EDGE_PATH,
  DRIVE_ROAD_VIEWBOX_WIDTH,
} from './roadGeometry';

type RoadProps = {
  isDark: boolean;
  children?: ReactNode;
  worldRef: RefObject<HTMLDivElement>;
  farLayerRef: RefObject<HTMLDivElement>;
  middleLayerRef: RefObject<HTMLDivElement>;
  nearLayerRef: RefObject<HTMLDivElement>;
};

export default function Road({
  isDark,
  children,
  worldRef,
  farLayerRef,
  middleLayerRef,
  nearLayerRef,
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
        <svg
          className="drive-road"
          viewBox={`-500 0 ${DRIVE_ROAD_VIEWBOX_WIDTH} 1000`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          style={{ left: '-500px', width: `${DRIVE_ROAD_VIEWBOX_WIDTH}px` }}
        >
          <path className="drive-road-surface" d={DRIVE_ROAD_CENTER_PATH} />
          <path className="drive-road-edge" d={DRIVE_ROAD_EDGE_PATH} />
          <path className="drive-road-marks" d={DRIVE_ROAD_CENTER_PATH} />
        </svg>
        {children}
      </div>
    </div>
  );
}
