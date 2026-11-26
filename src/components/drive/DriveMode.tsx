import { useCallback, useEffect, useRef, useState } from 'react';
import ConfettiBurst, { type ConfettiOrigin } from '../ConfettiBurst';
import useCarControls from '../../hooks/useCarControls';
import useGameLoop from '../../hooks/useGameLoop';
import { CONTACT_INFO } from '../../data/portfolioContent';
import Car from './Car';
import Road from './Road';
import Station from './Station';
import StationPanel from './StationPanel';
import TouchControls from './TouchControls';
import Hud from './Hud';
import { DRIVE_STATIONS, type DriveStation, type DriveStationId } from './stations';

type DriveModeProps = {
  isDark: boolean;
  onToggleTheme: () => void;
  onExitClassic: () => void;
};

export default function DriveMode({ isDark, onToggleTheme, onExitClassic }: DriveModeProps) {
  const worldRef = useRef<HTMLDivElement>(null);
  const farLayerRef = useRef<HTMLDivElement>(null);
  const middleLayerRef = useRef<HTMLDivElement>(null);
  const nearLayerRef = useRef<HTMLDivElement>(null);
  const roadMarksRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const [activeStation, setActiveStation] = useState<DriveStation | null>(null);
  const [visitedStations, setVisitedStations] = useState<Set<DriveStationId>>(() => new Set());
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiOrigin, setConfettiOrigin] = useState<ConfettiOrigin | null>(null);
  const celebrationShownRef = useRef(false);

  const openStationById = useCallback((stationId: string) => {
    const station = DRIVE_STATIONS.find((item) => item.id === stationId);
    if (!station) return;
    setVisitedStations((visited) => new Set(visited).add(station.id));
    setActiveStation(station);
  }, []);

  const handleStationClose = useCallback(() => setActiveStation(null), []);

  const controls = useCarControls(!activeStation);
  const game = useGameLoop({
    enabled: !activeStation,
    movementRef: controls.movementRef,
    worldRef,
    farLayerRef,
    middleLayerRef,
    nearLayerRef,
    roadMarksRef,
    carRef,
    stations: DRIVE_STATIONS,
    visitedStations,
    onStationApproach: openStationById,
  });
  const handleJumpToStation = useCallback(
    (station: DriveStation) => {
      game.jumpTo(station.worldPosition);
      openStationById(station.id);
    },
    [game.jumpTo, openStationById]
  );

  useEffect(() => {
    if (
      visitedStations.size !== DRIVE_STATIONS.length ||
      activeStation ||
      celebrationShownRef.current
    ) return;
    celebrationShownRef.current = true;
    setCelebrationVisible(true);
    setConfettiOrigin({ x: window.innerWidth / 2, y: window.innerHeight * 0.35 });
    setConfettiKey((key) => key + 1);
  }, [activeStation, visitedStations]);

  return (
    <main
      className="drive-mode"
      data-theme={isDark ? 'night' : 'day'}
      aria-label="Drive Mode portfolio exploration"
    >
      <Road
        isDark={isDark}
        worldRef={worldRef}
        farLayerRef={farLayerRef}
        middleLayerRef={middleLayerRef}
        nearLayerRef={nearLayerRef}
        roadMarksRef={roadMarksRef}
      >
        {DRIVE_STATIONS.map((station) => (
          <Station
            key={station.id}
            station={station}
            visited={visitedStations.has(station.id)}
            onOpen={handleJumpToStation}
          />
        ))}
      </Road>
      <Car ref={carRef} />
      <header className="drive-topbar">
        <div className="drive-brand">
          <span aria-hidden="true">AA</span>
          <span><b>Ali Akram</b><small>Portfolio Drive</small></span>
        </div>
        <div className="drive-topbar-actions">
          <span className="drive-speed-readout" aria-live="polite">
            {Math.round(Math.abs(game.speed) * 8)} <small>KM/H</small>
          </span>
          <button type="button" className="drive-icon-button" onClick={onToggleTheme} aria-label={`Switch to ${isDark ? 'day' : 'night'} scene`}>
            {isDark ? '☀' : '☾'}
          </button>
          <button type="button" className="drive-exit-button" onClick={onExitClassic}>
            Skip to classic view
          </button>
        </div>
      </header>
      {game.worldPosition < 20 && !activeStation && (
        <section className="drive-intro" aria-label="How to play">
          <span className="drive-eyebrow">INTERACTIVE PORTFOLIO</span>
          <h1>Take a drive through my work</h1>
          <p>Hold <kbd>→</kbd> or <kbd>D</kbd> to accelerate. <kbd>←</kbd> or <kbd>A</kbd> to brake.</p>
          <p className="drive-intro-secondary">Stop at the road signs to explore each portfolio section.</p>
        </section>
      )}
      <div className="drive-status" aria-live="polite">
        <span>{game.worldPosition.toLocaleString()} m</span>
        <span className="drive-status-separator">·</span>
        <span>{visitedStations.size}/{DRIVE_STATIONS.length} stations visited</span>
      </div>
      <Hud
        stations={DRIVE_STATIONS}
        visitedStations={visitedStations}
        worldPosition={game.worldPosition}
        muted={controls.muted}
        onJump={handleJumpToStation}
        onToggleMuted={() => controls.setMuted((muted) => !muted)}
      />
      <TouchControls
        onDirectionChange={controls.setTouchDirection}
        onHonk={controls.honk}
        onReleaseHorn={controls.releaseHorn}
        hornPressed={controls.hornPressed}
        muted={controls.muted}
      />
      {activeStation && <StationPanel station={activeStation} onClose={handleStationClose} />}
      {celebrationVisible && (
        <section className="drive-finish-card" role="status" aria-live="polite" aria-labelledby="drive-finish-title">
          <button
            type="button"
            className="drive-finish-close"
            onClick={() => setCelebrationVisible(false)}
            aria-label="Dismiss celebration"
          >
            ×
          </button>
          <span className="drive-finish-kicker">ROAD TRIP COMPLETE</span>
          <h2 id="drive-finish-title">You visited every station!</h2>
          <p>Thanks for exploring my portfolio. Have a project in mind?</p>
          <div className="drive-finish-actions">
            <a href={`mailto:${CONTACT_INFO.email}`}>Contact Ali <span aria-hidden="true">↗</span></a>
            <button type="button" onClick={onExitClassic}>Classic view</button>
          </div>
        </section>
      )}
      <ConfettiBurst
        burstKey={confettiKey}
        origin={confettiOrigin}
        reducedMotion={false}
      />
    </main>
  );
}
