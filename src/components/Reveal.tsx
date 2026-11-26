import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  reducedMotion?: boolean;
  stagger?: boolean;
};

export default function Reveal({
  children,
  className = '',
  delay = 0,
  reducedMotion = false,
  stagger = false,
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(reducedMotion);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const classes = ['reveal', stagger && 'reveal-stagger', isVisible && 'is-visible', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={elementRef} className={classes} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
