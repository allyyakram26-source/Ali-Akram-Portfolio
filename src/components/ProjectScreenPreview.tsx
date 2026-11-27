import { useEffect, useState } from 'react';
import type { Project } from '../data/portfolioContent';

type ProjectScreenPreviewProps = {
  project: Project;
  reducedMotion: boolean;
};

const SCREEN_LABELS: Record<Project['category'], [string, string, string]> = {
  'Mobile app': ['Home', 'Your workflow', 'Activity'],
  System: ['Overview', 'Records', 'Insights'],
  'UI design': ['Discover', 'Collection', 'Your order'],
};

function getInitials(title: string) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function ProjectScreenPreview({
  project,
  reducedMotion,
}: ProjectScreenPreviewProps) {
  const [activeScreen, setActiveScreen] = useState(0);
  const screenLabels = SCREEN_LABELS[project.category];

  useEffect(() => {
    if (reducedMotion) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveScreen((screen) => (screen + 1) % screenLabels.length);
    }, 4800);
    return () => window.clearInterval(intervalId);
  }, [activeScreen, project.id, reducedMotion, screenLabels.length]);

  const showScreen = (index: number) => {
    setActiveScreen((index + screenLabels.length) % screenLabels.length);
  };

  return (
    <div className="project-preview" data-project-category={project.category}>
      <div className="project-preview-heading">
        <div>
          <span className="project-preview-live-dot" />
          <span>INTERACTIVE APP CONCEPT</span>
        </div>
        <span className="project-preview-count">
          {String(activeScreen + 1).padStart(2, '0')} / 03
        </span>
      </div>

      <div className="project-device-frame">
        <div className="project-device-screen">
          <div className="project-device-status">
            <span>9:41</span>
            <span aria-hidden="true">● ● ● ▰</span>
          </div>
          <div className="project-device-appbar">
            <span className="project-device-app-icon">{getInitials(project.title)}</span>
            <span className="project-device-app-name">
              <small>PROJECT PREVIEW</small>
              <b>{project.title}</b>
            </span>
            <span className="project-device-avatar" aria-hidden="true">AA</span>
          </div>
          <div className="project-screen-window">
            <div
              className="project-screen-track"
              style={{ transform: `translateX(-${activeScreen * 100}%)` }}
            >
              {screenLabels.map((label, index) => (
                <section
                  key={label}
                  className="project-screen-slide"
                  aria-label={`${label} app screen`}
                  aria-hidden={activeScreen !== index}
                  data-active={activeScreen === index}
                >
                  {index === 0 && (
                    <>
                      <div className="project-screen-welcome">
                        <span className="project-screen-eyebrow">{label.toUpperCase()}</span>
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                      </div>
                      <div className="project-preview-feature">
                        <div className="project-preview-feature-top">
                          <span>MADE FOR YOUR FLOW</span>
                          <b aria-hidden="true">↗</b>
                        </div>
                        <div className="project-preview-orbit" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                          <span>{getInitials(project.title)}</span>
                        </div>
                        <strong>{project.tags[0]}</strong>
                        <small>Thoughtful tools, all in one place</small>
                      </div>
                      <div className="project-preview-mini-grid">
                        {project.tags.slice(1, 3).map((tag, tagIndex) => (
                          <div key={tag}>
                            <span>{tagIndex === 0 ? '✦' : '⌁'}</span>
                            <b>{tag}</b>
                            <small>Ready to explore</small>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="project-preview-action" tabIndex={-1}>
                        Explore {project.title} <span aria-hidden="true">→</span>
                      </button>
                    </>
                  )}

                  {index === 1 && (
                    <>
                      <div className="project-screen-welcome">
                        <span className="project-screen-eyebrow">{label.toUpperCase()}</span>
                        <h4>Everything, in rhythm.</h4>
                        <p>A closer look at the details behind this project.</p>
                      </div>
                      <div className="project-preview-list">
                        {project.breakdown.map((item, itemIndex) => (
                          <div className="project-preview-list-item" key={item}>
                            <span className={`project-preview-list-icon tone-${itemIndex}`}>
                              {['✦', '↗', '✓'][itemIndex]}
                            </span>
                            <span>
                              <small>STEP 0{itemIndex + 1}</small>
                              <b>{item}</b>
                            </span>
                            <i aria-hidden="true">✓</i>
                          </div>
                        ))}
                      </div>
                      <div className="project-preview-note">
                        <span aria-hidden="true">✧</span>
                        Designed around real user needs
                      </div>
                    </>
                  )}

                  {index === 2 && (
                    <>
                      <div className="project-screen-welcome">
                        <span className="project-screen-eyebrow">{label.toUpperCase()}</span>
                        <h4>Built to feel effortless.</h4>
                        <p>{project.breakdown[1] ?? project.description}</p>
                      </div>
                      <div className="project-preview-chart">
                        <div className="project-preview-chart-head">
                          <span>THE TOOLKIT</span>
                          <b>03 ELEMENTS</b>
                        </div>
                        <div className="project-preview-bars" aria-hidden="true">
                          {[36, 57, 44, 75, 58, 91, 68, 100, 79, 88, 63, 96].map((height, bar) => (
                            <i key={bar} style={{ height: `${height}%`, animationDelay: `${bar * 45}ms` }} />
                          ))}
                        </div>
                        <div className="project-preview-chart-caption">
                          <span>Simple</span><span>Connected</span><span>Scalable</span>
                        </div>
                      </div>
                      <div className="project-preview-tags">
                        {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                      <div className="project-preview-footer-mark">
                        <span>CRAFTED WITH CARE</span>
                        <span aria-hidden="true">✦ ✦ ✦</span>
                      </div>
                    </>
                  )}
                </section>
              ))}
            </div>
          </div>
          <div className="project-device-home-indicator" />
        </div>
      </div>

      <div className="project-preview-controls" aria-label="App preview screens">
        <button
          type="button"
          className="project-preview-arrow"
          aria-label="Previous app screen"
          onClick={() => showScreen(activeScreen - 1)}
        >
          ←
        </button>
        <div className="project-preview-dots">
          {screenLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              aria-label={`Show ${label} screen`}
              aria-current={activeScreen === index ? 'step' : undefined}
              onClick={() => showScreen(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="project-preview-arrow"
          aria-label="Next app screen"
          onClick={() => showScreen(activeScreen + 1)}
        >
          →
        </button>
      </div>
      <p className="project-preview-hint">3 screens · auto-playing preview</p>
    </div>
  );
}
