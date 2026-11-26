import { useEffect, useRef, useState } from 'react';

type CodeTerminalProps = {
  code: string;
  reducedMotion: boolean;
};

export default function CodeTerminal({ code, reducedMotion }: CodeTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [visibleCharacters, setVisibleCharacters] = useState(reducedMotion ? code.length : 0);
  const [started, setStarted] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleCharacters(code.length);
      setStarted(true);
      return undefined;
    }

    const terminal = terminalRef.current;
    if (!terminal || typeof IntersectionObserver === 'undefined') {
      setVisibleCharacters(code.length);
      setStarted(true);
      return undefined;
    }

    let frameId = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setStarted(true);
        const startedAt = performance.now();
        const duration = Math.min(Math.max(code.length * 9, 1400), 4000);
        let lastUpdate = 0;

        const typeCode = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          if (now - lastUpdate > 35 || progress === 1) {
            setVisibleCharacters(Math.floor(progress * code.length));
            lastUpdate = now;
          }
          if (progress < 1) frameId = requestAnimationFrame(typeCode);
          else setVisibleCharacters(code.length);
        };

        frameId = requestAnimationFrame(typeCode);
      },
      { threshold: 0.25 }
    );

    observer.observe(terminal);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [code, reducedMotion]);

  const lines = code.split('\n');
  let charactersBeforeLine = 0;
  const visibleLines = lines.map((line, index) => {
    const lineStart = charactersBeforeLine;
    charactersBeforeLine += line.length + 1;
    if (lineStart >= visibleCharacters && visibleCharacters < code.length) return null;

    const visibleLine = code.slice(lineStart, Math.min(lineStart + line.length, visibleCharacters));
    const lineClass = index === 0
      ? 'code-terminal-keyword'
      : line.includes("'") || line.includes('"')
        ? 'code-terminal-string'
        : 'code-terminal-value';

    return (
      <div className="code-terminal-line" key={index}>
        <span className="code-terminal-line-number" aria-hidden="true">{index + 1}</span>
        <span className={lineClass}>
          {visibleLine}
          {started && visibleCharacters < code.length && visibleCharacters >= lineStart &&
            visibleCharacters <= lineStart + line.length && (
              <span className="code-terminal-caret" aria-hidden="true" />
            )}
        </span>
      </div>
    );
  });

  return (
    <div
      ref={terminalRef}
      className="code-terminal"
      role="region"
      aria-label="Code example of Ali's professional profile"
    >
      <header className="code-terminal-header">
        <span className="code-terminal-lights" aria-hidden="true"><i /><i /><i /></span>
        <span>ali-profile.ts</span>
        <span className="code-terminal-language">TypeScript</span>
      </header>
      <div className="code-terminal-body" aria-hidden="true">{visibleLines}</div>
      <pre className="sr-only">{code}</pre>
    </div>
  );
}
