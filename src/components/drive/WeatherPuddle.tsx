import { getDriveRoadSurfaceY } from './roadGeometry';
import type { DrivePuddle as DrivePuddleData } from './weather';

type WeatherPuddleProps = {
  puddle: DrivePuddleData;
  isSplashing: boolean;
  splashKey: number;
};

export default function WeatherPuddle({
  puddle,
  isSplashing,
  splashKey,
}: WeatherPuddleProps) {
  const roadHeight = getDriveRoadSurfaceY(puddle.worldPosition);

  return (
    <div
      className={`drive-puddle${isSplashing ? ' is-splashing' : ''}`}
      style={{
        left: `${puddle.worldPosition}px`,
        bottom: `calc(100% - ${roadHeight}% + 5px)`,
      }}
      aria-hidden="true"
    >
      {isSplashing && <span key={splashKey} className="drive-puddle-splash" />}
    </div>
  );
}
