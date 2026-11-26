export const DRIVE_WORLD_WIDTH = 6600;

const ROAD_SAMPLE_STEP = 20;
export const DRIVE_ROAD_VIEWBOX_WIDTH = DRIVE_WORLD_WIDTH + 1000;

export function getDriveRoadSurfaceY(worldPosition: number) {
  return 69 + 5.5 * Math.sin(worldPosition / 420) + 2.2 * Math.sin(worldPosition / 210);
}

function createRoadPath(verticalOffset: number) {
  const start = -500;
  const end = DRIVE_WORLD_WIDTH + 500;
  const samples = Math.ceil((end - start) / ROAD_SAMPLE_STEP);

  return Array.from({ length: samples + 1 }, (_, index) => {
    const x = start + index * ROAD_SAMPLE_STEP;
    const y = (getDriveRoadSurfaceY(x) + verticalOffset) * 10;
    return `${index === 0 ? 'M' : 'L'}${x} ${y.toFixed(2)}`;
  }).join(' ');
}

export const DRIVE_ROAD_EDGE_PATH = createRoadPath(0);
export const DRIVE_ROAD_CENTER_PATH = createRoadPath(15.5);
