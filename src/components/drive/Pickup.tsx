import { getDriveRoadSurfaceY } from './roadGeometry';
import type { DrivePickup } from './pickups';

type PickupProps = {
  pickup: DrivePickup;
};

export default function Pickup({ pickup }: PickupProps) {
  const roadHeight = getDriveRoadSurfaceY(pickup.worldPosition);

  return (
    <div
      className={`drive-pickup${pickup.skill ? ' drive-pickup-skill' : ''}`}
      style={{
        left: `${pickup.worldPosition}px`,
        bottom: `calc(100% - ${roadHeight}% + 70px)`,
      }}
      aria-hidden="true"
    >
      <span className="drive-pickup-coin">✦</span>
      <small>{pickup.skill?.shortName ?? '+25%'}</small>
    </div>
  );
}
