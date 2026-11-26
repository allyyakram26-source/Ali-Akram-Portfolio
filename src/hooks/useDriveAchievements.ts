import { useCallback, useEffect, useRef, useState } from 'react';

export const DRIVE_ACHIEVEMENTS = [
  {
    id: 'first-stop',
    name: 'First Stop',
    description: 'Visit your first portfolio station.',
    icon: '📍',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Reach 88 km/h with Nitro.',
    icon: '⚡',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Visit every portfolio station.',
    icon: '🧭',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Drive 600 m in the night scene.',
    icon: '🌙',
  },
] as const;

export type DriveAchievementId = (typeof DRIVE_ACHIEVEMENTS)[number]['id'];

const STORAGE_KEY = 'ali-portfolio-drive-achievements';

function readAchievements() {
  if (typeof window === 'undefined') return new Set<DriveAchievementId>();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set<DriveAchievementId>();
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return new Set<DriveAchievementId>();

    return new Set(
      DRIVE_ACHIEVEMENTS
        .filter((achievement) => parsed.includes(achievement.id))
        .map((achievement) => achievement.id)
    );
  } catch (error) {
    console.warn('Unable to load Drive Mode achievements.', error);
    return new Set<DriveAchievementId>();
  }
}

export default function useDriveAchievements() {
  const [unlocked, setUnlocked] = useState(readAchievements);
  const unlockedRef = useRef(unlocked);
  const [latest, setLatest] = useState<DriveAchievementId | null>(null);

  const unlock = useCallback((achievementId: DriveAchievementId) => {
    if (unlockedRef.current.has(achievementId)) return;

    const next = new Set(unlockedRef.current);
    next.add(achievementId);
    unlockedRef.current = next;
    setUnlocked(next);
    setLatest(achievementId);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch (error) {
      console.warn('Unable to save Drive Mode achievements.', error);
    }
  }, []);

  useEffect(() => {
    if (!latest) return undefined;
    const timeoutId = window.setTimeout(() => setLatest(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [latest]);

  return { unlocked, latest, unlock };
}
