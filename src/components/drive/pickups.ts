export type DrivePickup = {
  id: string;
  worldPosition: number;
  skill?: {
    name: string;
    shortName: string;
  };
};

export const DRIVE_PICKUPS: readonly DrivePickup[] = [
  { id: 'star-1', worldPosition: 550 },
  {
    id: 'star-2',
    worldPosition: 1160,
    skill: { name: 'React Native', shortName: 'RN' },
  },
  { id: 'star-3', worldPosition: 2200 },
  {
    id: 'star-4',
    worldPosition: 3240,
    skill: { name: 'TypeScript', shortName: 'TS' },
  },
  { id: 'star-5', worldPosition: 4280 },
  {
    id: 'star-6',
    worldPosition: 5320,
    skill: { name: 'Firebase', shortName: 'FB' },
  },
];

export const DRIVE_SKILL_PICKUPS = DRIVE_PICKUPS.filter((pickup) => pickup.skill);
