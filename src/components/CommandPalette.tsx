import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

export type PaletteSection = {
  id: string;
  label: string;
};

type CommandPaletteProps = {
  open: boolean;
  sections: PaletteSection[];
  isDark: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  onCopyEmail: () => void;
};

type CommandItem = {
  id: string;
  title: string;
  detail: string;
  keywords: string;
  run: () => void;
};

function fuzzyScore(query: string, value: string) {
  let score = 0;
  let cursor = 0;

  for (const character of query) {
    const matchIndex = value.indexOf(character, cursor);
    if (matchIndex === -1) return -1;
    score += matchIndex === cursor ? 3 : Math.max(0, 2 - (matchIndex - cursor) * 0.15);
    cursor = matchIndex + 1;
  }

  return score - value.length * 0.01;
}

export default function CommandPalette({
  open,
  sections,
  isDark,
  reducedMotion,
  onClose,
  onToggleTheme,
  onCopyEmail,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const commands = useMemo<CommandItem[]>(
    () => [
      ...sections.map((section) => ({
        id: `section-${section.id}`,
        title: `Go to ${section.label}`,
        detail: `Navigate to the ${section.label} section`,
        keywords: `${section.id} section navigate scroll`,
        run: () =>
          document
            .getElementById(section.id)
            ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }),
      })),
      {
        id: 'toggle-theme',
        title: `Switch to ${isDark ? 'light' : 'dark'} theme`,
        detail: 'Change the portfolio appearance',
        keywords: 'theme dark light appearance color',
        run: onToggleTheme,
      },
      {
        id: 'open-github',
        title: 'Open GitHub profile',
        detail: 'github.com/ali-akram12',
        keywords: 'github code repository profile',
        run: () => window.open('https://github.com/ali-akram12', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'open-linkedin',
        title: 'Open LinkedIn profile',
        detail: 'Connect with Ali on LinkedIn',
        keywords: 'linkedin connect social profile',
        run: () =>
          window.open('https://www.linkedin.com/in/ali-akram-821491213/', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'copy-email',
        title: 'Copy email address',
        detail: 'Alleeakram007@gmail.com',
        keywords: 'email copy contact clipboard',
        run: onCopyEmail,
      },
    ],
    [isDark, onCopyEmail, onToggleTheme, reducedMotion, sections]
  );

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;

    return commands
      .map((command) => {
        const searchableTokens = [command.title, command.detail, command.keywords]
          .flatMap((field) => field.toLowerCase().match(/[a-z0-9]+/g) || []);
        const score = normalized
          .split(/\s+/)
          .reduce((total, term) => {
            const termScore = Math.max(...searchableTokens.map((token) => fuzzyScore(term, token)));
            return termScore < 0 ? -1 : total + termScore;
          }, 0);
        return { command, score };
      })
      .filter((result) => result.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.command);
  }, [commands, query]);

  const selectedIndex = Math.min(activeIndex, Math.max(filteredCommands.length - 1, 0));

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery('');
    setActiveIndex(0);
    inputRef.current?.focus();
    return () => previousFocusRef.current?.focus();
  }, [open]);

  useEffect(() => {
    optionRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, filteredCommands.length]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(filteredCommands.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + filteredCommands.length) % Math.max(filteredCommands.length, 1));
    } else if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
      event.preventDefault();
      filteredCommands[selectedIndex].run();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="command-palette-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio command palette"
      >
        <div className="command-palette-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path strokeLinecap="round" d="m16 16 4.5 4.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, and links..."
            aria-label="Search commands"
            aria-controls="command-palette-results"
            aria-autocomplete="list"
          />
          <kbd>ESC</kbd>
        </div>
        <div className="command-palette-list" id="command-palette-results" role="listbox" aria-label="Commands">
          {filteredCommands.length ? (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={selectedIndex === index}
                className={`command-palette-option ${selectedIndex === index ? 'is-selected' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  command.run();
                  onClose();
                }}
              >
                <span className="command-palette-option-icon" aria-hidden="true">
                  {command.id.startsWith('section-') ? '↗' : command.id === 'toggle-theme' ? '◐' : '⌘'}
                </span>
                <span className="command-palette-option-copy">
                  <span>{command.title}</span>
                  <small>{command.detail}</small>
                </span>
                {selectedIndex === index && <kbd>↵</kbd>}
              </button>
            ))
          ) : (
            <p className="command-palette-empty">No matching commands</p>
          )}
        </div>
        <footer className="command-palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
          <span><kbd>↵</kbd> to select</span>
          <span className="command-palette-theme">{isDark ? 'Dark theme' : 'Light theme'}</span>
        </footer>
      </section>
    </div>
  );
}
