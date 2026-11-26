export type DriveWeather = 'rain' | 'fog' | 'snow' | 'clear';

export const DRIVE_WEATHER_OPTIONS: readonly DriveWeather[] = [
  'rain',
  'fog',
  'snow',
  'clear',
];

export const DRIVE_WEATHER_LABELS: Record<DriveWeather, string> = {
  rain: 'Rain',
  fog: 'Fog',
  snow: 'Snow',
  clear: 'Clear',
};

export const DRIVE_WEATHER_ICONS: Record<DriveWeather, string> = {
  rain: '🌧',
  fog: '🌫',
  snow: '❄',
  clear: '☀',
};

export type DrivePuddle = {
  id: string;
  worldPosition: number;
};

export const DRIVE_PUDDLES: readonly DrivePuddle[] = [
  { id: 'puddle-1', worldPosition: 980 },
  { id: 'puddle-2', worldPosition: 1980 },
  { id: 'puddle-3', worldPosition: 3020 },
  { id: 'puddle-4', worldPosition: 4060 },
  { id: 'puddle-5', worldPosition: 5100 },
  { id: 'puddle-6', worldPosition: 6340 },
];
