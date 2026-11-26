import { useEffect, useRef } from 'react';
import type { DriveStation } from './stations';

type StationPanelProps = {
  station: DriveStation;
  onClose: () => void;
};

const SKILL_MARKS: Record<string, string> = {
  'React Native': 'RN',
  'Node.js': 'JS',
  'SQL Server': 'DB',
  JavaScript: 'JS',
  'Redux Toolkit': 'RT',
  'State management': 'ST',
  'REST API handling': 'API',
  Firebase: 'FB',
  'Git / GitHub': 'GH',
  Postman: 'PM',
  'Google Cloud Console': 'GC',
  'Android Studio': 'AS',
};

function SkillChip({ skill }: { skill: string }) {
  return (
    <li className="drive-skill-chip">
      <span className="drive-skill-mark" aria-hidden="true">
        {SKILL_MARKS[skill] || skill.slice(0, 2).toUpperCase()}
      </span>
      <span>{skill}</span>
    </li>
  );
}

function StationContent({ station }: { station: DriveStation }) {
  switch (station.content.type) {
    case 'about':
      return (
        <div className="drive-panel-copy">
          {station.content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="drive-panel-callout">React Native · Mobile UX · Applied AI &amp; Data Analytics</div>
        </div>
      );
    case 'skills':
      return (
        <div className="drive-panel-stack">
          <h3>Core skills</h3>
          <ul className="drive-skill-grid">
            {station.content.core.map((skill) => <SkillChip key={skill} skill={skill} />)}
          </ul>
          <h3>Tools and practices</h3>
          <ul className="drive-skill-grid drive-skill-grid-secondary">
            {station.content.tools.map((skill) => <SkillChip key={skill} skill={skill} />)}
          </ul>
        </div>
      );
    case 'education':
      return (
        <ol className="drive-panel-timeline">
          {station.content.items.map((item) => (
            <li key={item.id}>
              <span className="drive-panel-period">{item.period}</span>
              <h3>{item.degree}</h3>
              <p>{item.institution}</p>
              <small>{item.dissertation}</small>
            </li>
          ))}
        </ol>
      );
    case 'experience':
      return (
        <ol className="drive-panel-timeline drive-panel-experience">
          {station.content.items.map((item) => (
            <li key={item.id}>
              <span className="drive-panel-period">{item.period}</span>
              <h3>{item.role}</h3>
              <p>{item.org}{item.current ? ' · Current' : ''}</p>
              <ul>
                {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      );
    case 'projects': {
      const githubLink = station.content.github;
      return (
        <div className="drive-panel-projects">
          {station.content.items.map((project) => (
            <article key={project.id} className="drive-panel-project">
              <span className="drive-panel-period">{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <ul className="drive-project-tags">
                {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                View GitHub profile <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      );
    }
    case 'contact': {
      const { details } = station.content;
      return (
        <div className="drive-contact-links">
          <p>Have a mobile app idea or a project to discuss? I’d be glad to hear from you.</p>
          <a href={`mailto:${details.email}`}><span aria-hidden="true">✉</span>{details.email}</a>
          <a href={details.phoneHref}><span aria-hidden="true">☎</span>{details.phone}</a>
          <a href={details.linkedin} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">in</span>LinkedIn profile ↗</a>
          <a href={details.github} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⌘</span>GitHub profile ↗</a>
        </div>
      );
    }
  }
}

export default function StationPanel({ station, onClose }: StationPanelProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, [onClose]);

  return (
    <div
      className="drive-panel-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className={`drive-station-panel drive-station-panel-${station.accent}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drive-panel-title"
        tabIndex={-1}
      >
        <header className="drive-panel-header">
          <div>
            <span className="drive-panel-eyebrow">PORTFOLIO STOP · {station.subtitle.toUpperCase()}</span>
            <h2 id="drive-panel-title">{station.label}</h2>
          </div>
          <button ref={closeButtonRef} type="button" className="drive-panel-close" onClick={onClose} aria-label="Close station panel">
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className="drive-panel-body">
          <StationContent station={station} />
        </div>
        <footer className="drive-panel-footer">
          <span>Station visited · Drive forward to close</span>
          <button type="button" onClick={onClose}>Back to the road <span aria-hidden="true">→</span></button>
        </footer>
      </section>
    </div>
  );
}
