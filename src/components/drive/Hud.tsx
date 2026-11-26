import { useState } from 'react';
import type { DriveStation, DriveStationId } from './stations';
import { DRIVE_WORLD_WIDTH } from '../../hooks/useGameLoop';

type HudProps = {
  stations: readonly DriveStation[];
  visitedStations: ReadonlySet<DriveStationId>;
  collectedPickupCount: number;
  totalPickups: number;
  worldPosition: number;
  muted: boolean;
  boostFuel: number;
  boostPressed: boolean;
  boosting: boolean;
  onJump: (station: DriveStation) => void;
  onToggleMuted: () => void;
  onBoostChange: (pressed: boolean) => void;
};

export default function Hud({
  stations,
  visitedStations,
  collectedPickupCount,
  totalPickups,
  worldPosition,
  muted,
  boostFuel,
  boostPressed,
  boosting,
  onJump,
  onToggleMuted,
  onBoostChange,
}: HudProps) {
  const [selectedStationId, setSelectedStationId] = useState('');
  const progress = Math.min(Math.max(worldPosition / DRIVE_WORLD_WIDTH, 0), 1);

  const jumpTo = (stationId: string) => {
    const station = stations.find((item) => item.id === stationId);
    if (!station) return;
    setSelectedStationId('');
    onJump(station);
  };

  return (
    <aside className="drive-hud" aria-label="Drive Mode progress and navigation">
      <div className="drive-hud-topline">
        <span>ROAD TRIP PROGRESS</span>
        <div className="drive-hud-counts">
          <b>{visitedStations.size}/{stations.length} visited</b>
          <b
            className="drive-star-count"
            aria-label={`${collectedPickupCount} of ${totalPickups} nitro stars collected`}
          >
            ✦ {collectedPickupCount}/{totalPickups}
          </b>
        </div>
      </div>
      <div
        className="drive-map"
        role="group"
        aria-label={`Portfolio station map, ${visitedStations.size} of ${stations.length} visited`}
      >
        <span className="drive-map-fill" style={{ transform: `scaleX(${progress})` }} />
        {stations.map((station) => (
          <button
            key={station.id}
            type="button"
            className={`drive-map-stop ${visitedStations.has(station.id) ? 'is-visited' : ''}`}
            style={{ left: `${(station.worldPosition / DRIVE_WORLD_WIDTH) * 100}%` }}
            aria-label={`${visitedStations.has(station.id) ? 'Revisit' : 'Jump to'} ${station.label}`}
            title={station.label}
            onClick={() => jumpTo(station.id)}
          >
            <span aria-hidden="true">{visitedStations.has(station.id) ? '✓' : ''}</span>
          </button>
        ))}
      </div>
      <div className={`drive-boost-row ${boosting ? 'is-boosting' : ''}`}>
        <div className="drive-boost-meter">
          <div className="drive-boost-label">
            <span>⚡ NITRO</span>
            <b>{boosting ? 'ACTIVE' : `${Math.round(boostFuel)}%`}</b>
          </div>
          <div
            className="drive-boost-track"
            role="progressbar"
            aria-label="Nitro charge"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(boostFuel)}
          >
            <span style={{ transform: `scaleX(${boostFuel / 100})` }} />
          </div>
        </div>
        <button
          type="button"
          className={`drive-boost-button ${boostPressed ? 'is-pressed' : ''}`}
          aria-label="Hold to activate nitro boost"
          aria-keyshortcuts="Shift"
          aria-pressed={boostPressed}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            onBoostChange(true);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            onBoostChange(false);
          }}
          onPointerCancel={() => onBoostChange(false)}
          onLostPointerCapture={() => onBoostChange(false)}
        >
          <span aria-hidden="true">⚡</span>
          <small>Turbo</small>
        </button>
      </div>
      <span className="sr-only" role="progressbar" aria-label="Distance through the portfolio road" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} />
      <div className="drive-hud-bottom">
        <label className="drive-jump-label">
          <span>Jump to station</span>
          <select
            value={selectedStationId}
            aria-label="Jump to station"
            onChange={(event) => jumpTo(event.target.value)}
          >
            <option value="">Choose a stop…</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.label}{visitedStations.has(station.id) ? ' · visited' : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="drive-mute-button"
          aria-pressed={!muted}
          aria-label={muted ? 'Unmute horn sound' : 'Mute horn sound'}
          onClick={onToggleMuted}
        >
          <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
          {muted ? 'Muted' : 'Sound on'}
        </button>
      </div>
    </aside>
  );
}
