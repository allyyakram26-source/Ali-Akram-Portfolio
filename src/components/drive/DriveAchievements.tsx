import { useState } from 'react';
import {
  DRIVE_ACHIEVEMENTS,
  type DriveAchievementId,
} from '../../hooks/useDriveAchievements';

type DriveAchievementsProps = {
  unlocked: ReadonlySet<DriveAchievementId>;
  latest: DriveAchievementId | null;
};

export default function DriveAchievements({ unlocked, latest }: DriveAchievementsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const latestAchievement = DRIVE_ACHIEVEMENTS.find((item) => item.id === latest);

  return (
    <section className="drive-achievements">
      <button
        type="button"
        className="drive-achievements-toggle"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'drive-achievements-list' : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>🏅 Badges</span>
        <b>{unlocked.size}/{DRIVE_ACHIEVEMENTS.length}</b>
      </button>
      {isOpen && (
        <ul id="drive-achievements-list" className="drive-achievements-list">
          {DRIVE_ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlocked.has(achievement.id);
            return (
              <li
                key={achievement.id}
                className={isUnlocked ? 'is-unlocked' : ''}
              >
                <span aria-hidden="true">{achievement.icon}</span>
                <span>
                  <b>{achievement.name}</b>
                  <small>{achievement.description}</small>
                </span>
                <i>{isUnlocked ? 'Unlocked' : 'Locked'}</i>
              </li>
            );
          })}
        </ul>
      )}
      {latestAchievement && !isOpen && (
        <div className="drive-achievement-toast" role="status" aria-live="polite">
          <span aria-hidden="true">{latestAchievement.icon}</span>
          <span>
            <b>Badge unlocked: {latestAchievement.name}</b>
            <small>{latestAchievement.description}</small>
          </span>
        </div>
      )}
    </section>
  );
}
