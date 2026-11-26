import type { DriveStation } from './stations';

type StationProps = {
  station: DriveStation;
  visited: boolean;
  onOpen: (station: DriveStation) => void;
};

export default function Station({ station, visited, onOpen }: StationProps) {
  return (
    <button
      type="button"
      className={`drive-station drive-station-${station.accent} ${visited ? 'is-visited' : ''}`}
      style={{ left: `${station.worldPosition}px` }}
      aria-label={`${visited ? 'Revisit' : 'Visit'} ${station.label} station`}
      onClick={() => onOpen(station)}
    >
      <span className="drive-station-sign">
        <span className="drive-station-number">{String(Math.round(station.worldPosition / 900)).padStart(2, '0')}</span>
        <b>{station.label}</b>
        <small>{station.subtitle}</small>
      </span>
      <span className="drive-station-building" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="drive-station-base" aria-hidden="true" />
      {visited && <span className="drive-station-visited" aria-hidden="true">✓</span>}
    </button>
  );
}
