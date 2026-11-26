import { useCallback, useEffect, useRef, useState } from 'react';
import ConfettiBurst, { type ConfettiOrigin } from '../ConfettiBurst';
import useCarControls from '../../hooks/useCarControls';
import useGameLoop, { DRIVE_WORLD_WIDTH } from '../../hooks/useGameLoop';
import useDriveAchievements from '../../hooks/useDriveAchievements';
import { CONTACT_INFO } from '../../data/portfolioContent';
import Car from './Car';
import Road from './Road';
import Station from './Station';
import StationPanel from './StationPanel';
import TouchControls from './TouchControls';
import Hud from './Hud';
import Pickup from './Pickup';
import { DRIVE_PICKUPS, DRIVE_SKILL_PICKUPS } from './pickups';
import { DRIVE_STATIONS, type DriveStation, type DriveStationId } from './stations';
import { getDriveRoadSurfaceY } from './roadGeometry';
import WeatherEffects from './WeatherEffects';
import WeatherPuddle from './WeatherPuddle';
import {
  DRIVE_PUDDLES,
  DRIVE_WEATHER_OPTIONS,
  type DriveWeather,
} from './weather';

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
  const carRef = useRef<HTMLDivElement>(null);
  const nightDistanceRef = useRef(0);
  const previousWorldPositionRef = useRef(0);
  const splashedPuddlesRef = useRef(new Set<string>());
  const splashKeyRef = useRef(0);
  const achievements = useDriveAchievements();
  const [activeStation, setActiveStation] = useState<DriveStation | null>(null);
  const [visitedStations, setVisitedStations] = useState<Set<DriveStationId>>(() => new Set());
  const [collectedPickups, setCollectedPickups] = useState<Set<string>>(() => new Set());
  const [weather, setWeather] = useState<DriveWeather>('rain');
  const [activePuddleSplash, setActivePuddleSplash] = useState<{
    id: string;
    key: number;
  } | null>(null);
  const [pickupToastId, setPickupToastId] = useState<string | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiOrigin, setConfettiOrigin] = useState<ConfettiOrigin | null>(null);
  const celebrationShownRef = useRef(false);

  const openStationById = useCallback((stationId: string) => {
    const station = DRIVE_STATIONS.find((item) => item.id === stationId);
    if (!station) return;
    setVisitedStations((visited) => new Set(visited).add(station.id));
    setActiveStation(station);
    achievements.unlock('first-stop');
  }, [achievements.unlock]);

  const handleStationClose = useCallback(() => setActiveStation(null), []);
  const handlePickup = useCallback((pickupId: string) => {
    setCollectedPickups((collected) => new Set(collected).add(pickupId));
    setPickupToastId(pickupId);
  }, []);
  const cycleWeather = useCallback(() => {
    setWeather((current) => {
      const currentIndex = DRIVE_WEATHER_OPTIONS.indexOf(current);
      return DRIVE_WEATHER_OPTIONS[(currentIndex + 1) % DRIVE_WEATHER_OPTIONS.length];
    });
  }, []);

  const controls = useCarControls(true);
  const game = useGameLoop({
    enabled: true,
    movementRef: controls.movementRef,
    worldRef,
    farLayerRef,
    middleLayerRef,
    nearLayerRef,
    carRef,
    stations: DRIVE_STATIONS,
    visitedStations,
    pickups: DRIVE_PICKUPS,
    collectedPickups,
    onStationApproach: openStationById,
    onPickup: handlePickup,
  });
  const handleJumpToStation = useCallback(
    (station: DriveStation) => {
      game.jumpTo(station.worldPosition);
      openStationById(station.id);
    },
    [game.jumpTo, openStationById]
  );

  useEffect(() => {
    if (!activeStation) return;
    const carWorldPosition = game.worldPosition + window.innerWidth * 0.2;
    const reachedRoadEndWhileDriving =
      game.worldPosition >= DRIVE_WORLD_WIDTH - window.innerWidth &&
      controls.movementRef.current.right;
    if (
      carWorldPosition - activeStation.worldPosition > 160 ||
      reachedRoadEndWhileDriving
    ) {
      setActiveStation(null);
    }
  }, [activeStation, controls.movementRef, game.speed, game.worldPosition]);

  useEffect(() => {
    if (game.speed >= 11) achievements.unlock('speed-demon');
  }, [achievements.unlock, game.speed]);

  useEffect(() => {
    const distanceSinceUpdate = game.worldPosition - previousWorldPositionRef.current;
    previousWorldPositionRef.current = game.worldPosition;
    if (isDark && distanceSinceUpdate > 0 && distanceSinceUpdate < 120) {
      nightDistanceRef.current += distanceSinceUpdate;
      if (nightDistanceRef.current >= 600) achievements.unlock('night-owl');
    }
  }, [achievements.unlock, game.worldPosition, isDark]);

  useEffect(() => {
    if (weather !== 'rain' || game.speed <= 1) return;
    const carWorldPosition = game.worldPosition + window.innerWidth * 0.2;
    const puddle = DRIVE_PUDDLES.find(
      (item) =>
        !splashedPuddlesRef.current.has(item.id) &&
        Math.abs(item.worldPosition - carWorldPosition) < 90
    );
    if (!puddle) return;

    splashedPuddlesRef.current.add(puddle.id);
    splashKeyRef.current += 1;
    setActivePuddleSplash({ id: puddle.id, key: splashKeyRef.current });
  }, [game.speed, game.worldPosition, weather]);

  useEffect(() => {
    if (!activePuddleSplash) return undefined;
    const timeoutId = window.setTimeout(() => setActivePuddleSplash(null), 520);
    return () => window.clearTimeout(timeoutId);
  }, [activePuddleSplash]);

  useEffect(() => {
    if (
      visitedStations.size !== DRIVE_STATIONS.length ||
      activeStation ||
      celebrationShownRef.current
    ) return;
    achievements.unlock('explorer');
    celebrationShownRef.current = true;
    setCelebrationVisible(true);
    setConfettiOrigin({ x: window.innerWidth / 2, y: window.innerHeight * 0.35 });
    setConfettiKey((key) => key + 1);
  }, [activeStation, achievements.unlock, visitedStations]);

  useEffect(() => {
    if (weather !== 'rain') setActivePuddleSplash(null);
  }, [weather]);

  useEffect(() => {
    if (!pickupToastId) return undefined;
    const timeoutId = window.setTimeout(() => setPickupToastId(null), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [pickupToastId]);

  return (
    <main
      className="drive-mode"
      data-theme={isDark ? 'night' : 'day'}
      data-weather={weather}
      aria-label="Drive Mode portfolio exploration"
    >
      <Road
        isDark={isDark}
        worldRef={worldRef}
        farLayerRef={farLayerRef}
        middleLayerRef={middleLayerRef}
        nearLayerRef={nearLayerRef}
      >
        {DRIVE_STATIONS.map((station) => (
          <Station
            key={station.id}
            station={station}
            visited={visitedStations.has(station.id)}
            onOpen={handleJumpToStation}
          />
        ))}
        {DRIVE_PICKUPS.filter((pickup) => !collectedPickups.has(pickup.id)).map((pickup) => (
          <Pickup key={pickup.id} pickup={pickup} />
        ))}
        {weather === 'rain' && DRIVE_PUDDLES.map((puddle) => (
          <WeatherPuddle
            key={puddle.id}
            puddle={puddle}
            isSplashing={activePuddleSplash?.id === puddle.id}
            splashKey={activePuddleSplash?.key ?? 0}
          />
        ))}
      </Road>
      <WeatherEffects weather={weather} />
      <Car
        ref={carRef}
        isRaining={weather === 'rain'}
        splashKey={activePuddleSplash?.key ?? 0}
      />
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
          <p>Build speed, then press <kbd>↑</kbd> or <kbd>W</kbd> to jump. Hold <kbd>Shift</kbd> or Turbo to boost.</p>
          <p className="drive-intro-secondary">Stop at road signs to explore, and grab glowing stars to refill Nitro.</p>
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
        collectedPickupCount={collectedPickups.size}
        totalPickups={DRIVE_PICKUPS.length}
        worldPosition={game.worldPosition}
        muted={controls.muted}
        weather={weather}
        boostFuel={game.boostFuel}
        boostPressed={controls.boostPressed}
        boosting={game.boosting}
        skillPickups={DRIVE_SKILL_PICKUPS}
        collectedPickupIds={collectedPickups}
        unlockedAchievements={achievements.unlocked}
        latestAchievement={achievements.latest}
        onJump={handleJumpToStation}
        onToggleMuted={() => controls.setMuted((muted) => !muted)}
        onCycleWeather={cycleWeather}
        onBoostChange={(pressed) => controls.setTouchControl('boost', pressed)}
      />
      {pickupToastId && (
        <div className="drive-pickup-toast" role="status" aria-live="polite">
          <span aria-hidden="true">✦</span>
          STAR COLLECTED <b>+25% NITRO</b>
        </div>
      )}
      <TouchControls
        onControlChange={controls.setTouchControl}
        onHonk={controls.honk}
        onReleaseHorn={controls.releaseHorn}
        hornPressed={controls.hornPressed}
        jumpPressed={controls.jumpPressed}
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
