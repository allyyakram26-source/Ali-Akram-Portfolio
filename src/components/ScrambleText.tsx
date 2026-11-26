import { useEffect, useState } from 'react';

type ScrambleTextProps = {
  text: string;
  reducedMotion?: boolean;
  className?: string;
};

const SCRAMBLE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+';

export default function ScrambleText({
  text,
  reducedMotion = false,
  className = '',
}: ScrambleTextProps) {
  const [decodedText, setDecodedText] = useState(() =>
    reducedMotion ? text : text.replace(/\S/g, '·')
  );

  useEffect(() => {
    if (reducedMotion) {
      setDecodedText(text);
      return undefined;
    }

    let frameId = 0;
    let lastUpdatedAt = 0;
    const startedAt = performance.now();
    const duration = Math.max(700, text.length * 95);

    const animate = (now: number) => {
      if (now - lastUpdatedAt >= 42 || now - startedAt >= duration) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const decodedCount = Math.floor(progress * text.length);
        const output = Array.from(text, (character, index) => {
          if (character === ' ' || index < decodedCount || progress >= 1) return character;
          const randomIndex = Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length);
          return SCRAMBLE_CHARACTERS[randomIndex];
        }).join('');

        setDecodedText(output);
        lastUpdatedAt = now;
      }

      if (now - startedAt < duration) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion, text]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{decodedText}</span>
    </span>
  );
}
