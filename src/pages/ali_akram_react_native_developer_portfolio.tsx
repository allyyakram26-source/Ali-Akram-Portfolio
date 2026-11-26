import React, { useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback } from 'react';
import {
  ABOUT_PARAGRAPHS,
  CONTACT_INFO,
  CORE_SKILLS,
  EDUCATION,
  EXPERIENCES,
  NAV_ITEMS,
  PROJECTS,
  TOOL_SKILLS,
} from '../data/portfolioContent';
import type { Project, ProjectCategory } from '../data/portfolioContent';
import AnimatedBorder from '../components/AnimatedBorder';
import CommandPalette from '../components/CommandPalette';
import ConfettiBurst, { type ConfettiOrigin } from '../components/ConfettiBurst';
import CodeTerminal from '../components/CodeTerminal';
import Reveal from '../components/Reveal';
import ScrambleText from '../components/ScrambleText';
import PhoneTechOrbit from '../components/PhoneTechOrbit';
import TiltCard from '../components/TiltCard';
import useMagneticPointer from '../hooks/useMagneticPointer';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useSpotlightPointer from '../hooks/useSpotlightPointer';
import DriveMode from '../components/drive/DriveMode';

type Accent = 'cyan' | 'indigo' | 'emerald' | 'amber';

type Fact = {
  id: string;
  target?: number;
  staticValue?: string;
  suffix?: string;
  label: string;
  accent: Accent;
};

/**
 * Complete data definitions preserving every exact detail from Ali Akram's portfolio.
 */
const TYPING_PHRASES = [
  'cross-platform mobile apps',
  'finance dashboards',
  'service booking flows',
  'secure login experiences',
];

const FACTS: Fact[] = [
  { id: 'years', target: 3, suffix: '+', label: 'years building mobile apps', accent: 'cyan' },
  { id: 'projects', target: 15, suffix: '', label: 'projects listed below', accent: 'indigo' },
  { id: 'degrees', target: 2, suffix: '', label: 'degrees: BS CS and MSc AI', accent: 'emerald' },
  { id: 'platform', staticValue: 'iOS + Android', label: 'one React Native codebase', accent: 'amber' },
];

const ALI_PROFILE_CODE = [
  'const ali = {',
  `  name: ${JSON.stringify(CONTACT_INFO.name)},`,
  `  role: ${JSON.stringify(CONTACT_INFO.role)},`,
  '  skills: [',
  ...CORE_SKILLS.map((skill) => `    ${JSON.stringify(skill)},`),
  '  ],',
  `  education: ${JSON.stringify('MSc Applied AI & Data Analytics, University of Bradford')},`,
  "  platforms: ['iOS', 'Android'],",
  '} as const;',
].join('\n');

const FINANCE_SCENARIOS = [
  {
    id: 'live',
    label: 'Live Sync',
    badge: 'LIVE SYNC',
    cash: 125000,
    bank: 840000,
    receivables: 210000,
    payables: 95000,
    assets: 1200000,
    stock: 340000,
    growth: '+14.8%',
    curvePath: 'M2 28 C 32 24, 48 12, 76 16 C 104 20, 124 8, 152 12 C 180 16, 198 4, 218 6',
  },
  {
    id: 'q4',
    label: 'Q4 Growth',
    badge: 'Q4 GROWTH',
    cash: 195000,
    bank: 1050000,
    receivables: 290000,
    payables: 75000,
    assets: 1350000,
    stock: 420000,
    growth: '+24.2%',
    curvePath: 'M2 31 C 36 27, 56 19, 84 14 C 112 9, 138 14, 166 6 C 186 2, 204 2, 218 2',
  },
  {
    id: 'audit',
    label: 'Audit Ready',
    badge: 'AUDIT READY',
    cash: 150000,
    bank: 910000,
    receivables: 185000,
    payables: 60000,
    assets: 1200000,
    stock: 375000,
    growth: '+18.5%',
    curvePath: 'M2 25 C 30 20, 52 21, 80 14 C 108 7, 132 16, 160 10 C 185 5, 202 8, 218 4',
  },
];

function formatRs(amount: number | null | undefined) {
  return 'Rs ' + Number(amount || 0).toLocaleString('en-US');
}

/**
 * Custom hook animating a number smoothly with cubic ease-out.
 */
function useAnimatedNumber(targetValue: number, duration = 750, triggerKey = 0, reducedMotion = false) {
  const [displayValue, setDisplayValue] = useState(targetValue);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(targetValue);
      return undefined;
    }

    let rafId: number | undefined;
    const startTime = performance.now();
    const startVal = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startVal + (targetValue - startVal) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [targetValue, duration, triggerKey, reducedMotion]);

  return displayValue;
}

/**
 * Error boundary so runtime errors render a graceful recovery screen instead of crashing.
 */
type PortfolioErrorBoundaryProps = {
  children: React.ReactNode;
};

type PortfolioErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

class PortfolioErrorBoundary extends React.Component<
  PortfolioErrorBoundaryProps,
  PortfolioErrorBoundaryState
> {
  constructor(props: PortfolioErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): PortfolioErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unexpected error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Portfolio render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#05080D] text-white">
          <div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#0B101B] p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Something interrupted the view</h2>
            <p className="text-sm text-slate-400 mb-6">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
              className="px-5 py-2.5 rounded-full bg-cyan-400 text-slate-950 font-semibold text-sm"
            >
              Reload Portfolio View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Interactive 3D-tilting iPhone simulator displaying Solochoicez financial summary
 * with automatic net position calculation, scenario tabs, and live recalculation.
 */
type InteractivePhoneSimulatorProps = {
  reducedMotion: boolean;
  onSetCursorLabel: (label: string) => void;
};

function InteractivePhoneSimulator({
  reducedMotion,
  onSetCursorLabel,
}: InteractivePhoneSimulatorProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [calcEpoch, setCalcEpoch] = useState(1);
  const [spinDeg, setSpinDeg] = useState(0);

  const currentScenario = FINANCE_SCENARIOS[scenarioIndex] || FINANCE_SCENARIOS[0];

  // Net position: Cash + Bank balance + Receivables - Payables + Assets + Stock value
  const netPositionTarget = useMemo(() => {
    return (
      currentScenario.cash +
      currentScenario.bank +
      currentScenario.receivables -
      currentScenario.payables +
      currentScenario.assets +
      currentScenario.stock
    );
  }, [currentScenario]);

  const animCash = useAnimatedNumber(currentScenario.cash, 750, calcEpoch, reducedMotion);
  const animBank = useAnimatedNumber(currentScenario.bank, 750, calcEpoch, reducedMotion);
  const animRec = useAnimatedNumber(currentScenario.receivables, 750, calcEpoch, reducedMotion);
  const animPay = useAnimatedNumber(currentScenario.payables, 750, calcEpoch, reducedMotion);
  const animAssets = useAnimatedNumber(currentScenario.assets, 750, calcEpoch, reducedMotion);
  const animStock = useAnimatedNumber(currentScenario.stock, 750, calcEpoch, reducedMotion);
  const animNet = useAnimatedNumber(netPositionTarget, 950, calcEpoch, reducedMotion);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      reducedMotion ||
      e.pointerType !== 'mouse' ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      !stageRef.current ||
      !bodyRef.current
    ) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const relX = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const relY = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    const rotY = (relX - 0.5) * 18;
    const rotX = -(relY - 0.5) * 15;
    bodyRef.current.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(280px circle at ${(relX * 100).toFixed(1)}% ${(relY * 100).toFixed(1)}%, rgba(255, 255, 255, 0.17), transparent 65%)`;
    }
  };

  const handlePointerLeave = () => {
    if (bodyRef.current) {
      bodyRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
    onSetCursorLabel('');
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== 'touch' ||
      (event.target instanceof Element && event.target.closest('button'))
    ) return;
    swipeStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;

    setScenarioIndex((index) =>
      (index + (deltaX < 0 ? 1 : FINANCE_SCENARIOS.length - 1)) % FINANCE_SCENARIOS.length
    );
    setCalcEpoch((previous) => previous + 1);
  };

  const handleSelectScenario = (idx: number) => {
    setScenarioIndex(idx);
    setCalcEpoch((prev) => prev + 1);
  };

  const handleRecalculate = () => {
    setSpinDeg((prev) => prev + 360);
    setScenarioIndex((prev) => (prev + 1) % FINANCE_SCENARIOS.length);
    setCalcEpoch((prev) => prev + 1);
  };

  const ledgerRows = [
    { label: 'Cash', value: formatRs(animCash), tone: 'text-slate-900 dark:text-white' },
    { label: 'Bank balance', value: formatRs(animBank), tone: 'text-slate-900 dark:text-white' },
    { label: 'Receivables', value: formatRs(animRec), tone: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Payables', value: formatRs(animPay), tone: 'text-rose-500' },
    { label: 'Assets', value: formatRs(animAssets), tone: 'text-slate-900 dark:text-white' },
    { label: 'Stock value', value: formatRs(animStock), tone: 'text-slate-900 dark:text-white' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => onSetCursorLabel('Tilt 3D')}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
        style={{ perspective: '1300px', touchAction: 'pan-y' }}
        className="phone-stage relative w-full max-w-[340px] mx-auto select-none"
      >
        <PhoneTechOrbit />

        {/* Floating Tech Badges around iPhone */}
        <div
          aria-hidden="true"
          className="tech-float tech-float-cyan hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#0B101B]/90 border border-cyan-400/40 shadow-xl backdrop-blur-md absolute -left-14 top-8 z-20"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">React Native</span>
        </div>

        <div
          aria-hidden="true"
          className="tech-float tech-float-indigo hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#0B101B]/90 border border-indigo-400/40 shadow-xl backdrop-blur-md absolute -right-12 top-24 z-20"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">Redux Toolkit</span>
        </div>

        <div
          aria-hidden="true"
          className="tech-float tech-float-amber hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#0B101B]/90 border border-amber-400/40 shadow-xl backdrop-blur-md absolute -left-12 bottom-32 z-20"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">Firebase</span>
        </div>

        <div
          aria-hidden="true"
          className="tech-float tech-float-emerald hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#0B101B]/90 border border-emerald-400/40 shadow-xl backdrop-blur-md absolute -right-11 bottom-14 z-20"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">REST APIs</span>
        </div>

        {/* 3D Phone Hardware Frame */}
        <div
          ref={bodyRef}
          role="group"
          aria-roledescription="interactive phone demo"
          aria-label="Interactive 3D finance app demo"
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.16s ease-out' }}
          className="relative w-[296px] sm:w-[312px] mx-auto rounded-[46px] p-[11px] bg-gradient-to-b from-slate-700 via-slate-900 to-black border border-white/15 shadow-[0_35px_80px_-18px_rgba(6,182,212,0.35)]"
        >
          {/* Glossy Glare Layer */}
          <div
            ref={glareRef}
            aria-hidden="true"
            className="absolute inset-0 rounded-[46px] pointer-events-none z-30"
          />

          {/* Dynamic Island */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-between px-2.5 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="w-2 h-2 rounded-full bg-indigo-950 border border-cyan-400/40" />
          </div>

          {/* Inner Screen */}
          <div className="relative rounded-[36px] bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 px-4 pt-10 pb-4 overflow-hidden border border-slate-200/70 dark:border-white/10">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
              <span className="font-semibold">9:41</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                {currentScenario.badge}
              </span>
            </div>

            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Solochoicez Finance
                </p>
                <h2 className="font-display font-bold text-base">Financial summary</h2>
              </div>
              <button
                type="button"
                onClick={handleRecalculate}
                onMouseEnter={() => onSetCursorLabel('Calc')}
                onMouseLeave={() => onSetCursorLabel('')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-mono text-[10px] font-semibold transition-all active:scale-90"
              >
                <svg
                  style={{ transform: `rotate(${spinDeg}deg)`, transition: 'transform 0.5s ease' }}
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Recalculate</span>
              </button>
            </div>

            {/* Scenario Preset Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.04] mb-2.5 font-mono text-[10px]">
              {FINANCE_SCENARIOS.map((sc, idx) => {
                const isSelected = idx === scenarioIndex;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleSelectScenario(idx)}
                    className={`py-1 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-cyan-500/20 text-slate-900 dark:text-cyan-300 font-semibold shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>

            {/* Sparkline Curve */}
            <div className="mb-2.5 p-2 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                <span>Net Liquidity Curve</span>
                <span className="text-emerald-500 font-semibold">{currentScenario.growth}</span>
              </div>
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 220 36" fill="none">
                <defs>
                  <linearGradient id="rnSparkGrad" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
                <path
                  d={currentScenario.curvePath}
                  stroke="url(#rnSparkGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Financial Rows */}
            <div className="space-y-1 text-xs">
              {ledgerRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/80 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5"
                >
                  <span className="text-slate-600 dark:text-slate-400">{row.label}</span>
                  <b className={`font-mono font-semibold tabular-nums ${row.tone}`}>{row.value}</b>
                </div>
              ))}
            </div>

            {/* Auto-Calculated Net Position */}
            <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 text-white shadow-lg shadow-indigo-500/25">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-cyan-100">
                    Net position (Auto)
                  </span>
                  <b className="font-mono text-base font-bold tracking-tight tabular-nums">
                    {formatRs(animNet)}
                  </b>
                </div>
                <span className="px-2 py-1 rounded-lg bg-black/25 font-mono text-[10px] font-semibold">
                  Redux
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-xs text-slate-500 dark:text-slate-400 max-w-xs">
        Tap a scenario or swipe to switch screens · sample Solochoicez finance data
      </p>
    </div>
  );
}

/**
 * KPI counter card that counts up once when scrolled into view.
 */
type KpiFactCardProps = {
  fact: Fact;
  reducedMotion: boolean;
};

function KpiFactCard({ fact, reducedMotion }: KpiFactCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reducedMotion);
  const [count, setCount] = useState(fact.target || 0);
  const spotlightMotion = useSpotlightPointer(!reducedMotion);

  useEffect(() => {
    if (reducedMotion || !fact.target) {
      setVisible(true);
      setCount(fact.target || 0);
      return undefined;
    }

    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      setCount(fact.target);
      return undefined;
    }

    let started = false;
    let rafId: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            setVisible(true);
            const startTime = performance.now();
            const duration = 1100;

            const tick = (now: number) => {
              const p = Math.min((now - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setCount(Math.round((fact.target ?? 0) * eased));
              if (p < 1) {
                rafId = requestAnimationFrame(tick);
              }
            };
            rafId = requestAnimationFrame(tick);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [fact.target, reducedMotion]);

  const borderClass = {
    cyan: 'border-t-cyan-400 text-cyan-500 dark:text-cyan-400',
    indigo: 'border-t-indigo-400 text-indigo-500 dark:text-indigo-400',
    emerald: 'border-t-emerald-400 text-emerald-500 dark:text-emerald-400',
    amber: 'border-t-amber-400 text-amber-500 dark:text-amber-400',
  }[fact.accent] || 'border-t-cyan-400 text-cyan-500 dark:text-cyan-400';

  return (
    <div
      ref={cardRef}
      onPointerMove={spotlightMotion.onPointerMove}
      onPointerLeave={spotlightMotion.onPointerLeave}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: reducedMotion ? 'none' : 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`spotlight-card p-6 rounded-3xl bg-white/85 dark:bg-[#0B101B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 border-t-4 ${borderClass} flex flex-col justify-between`}
    >
      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Metric</span>
      <div className="my-3 relative z-10">
        <b className="font-syne font-extrabold text-2xl sm:text-3xl tabular-nums">
          {fact.staticValue ? fact.staticValue : `${count}${fact.suffix}`}
        </b>
      </div>
      <span className="text-sm text-slate-600 dark:text-slate-400 relative z-10">{fact.label}</span>
    </div>
  );
}

type ClassicPortfolioProps = {
  prefersReducedMotion: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  onEnableDrive: () => void;
};

function ClassicPortfolio({
  prefersReducedMotion,
  isDark,
  toggleTheme,
  onEnableDrive,
}: ClassicPortfolioProps) {
  const emailCtaMotion = useMagneticPointer<HTMLSpanElement>(!prefersReducedMotion);
  const copyCtaMotion = useMagneticPointer<HTMLSpanElement>(!prefersReducedMotion);
  const spotlightMotion = useSpotlightPointer(!prefersReducedMotion);
  const heroSpotlightMotion = useSpotlightPointer(!prefersReducedMotion);

  // Preloader state
  const [showPreloader, setShowPreloader] = useState(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem('ali-portfolio-intro-seen') !== 'true';
    } catch (_) {
      return false;
    }
  });

  // Navigation & scroll states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [navIndicator, setNavIndicator] = useState({ left: 0, width: 0 });
  const [scrollFraction, setScrollFraction] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [timelineFillProgress, setTimelineFillProgress] = useState(0);
  const [educationTimelineFillProgress, setEducationTimelineFillProgress] = useState(0);

  // Typewriter phrase state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(prefersReducedMotion ? TYPING_PHRASES[0].length : 0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Project filter & modal state
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Toast feedback state
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);
  const [confettiOrigin, setConfettiOrigin] = useState<ConfettiOrigin | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiKeysRef = useRef<string[]>([]);

  // Custom magnetic cursor state
  const [cursorLabel, setCursorLabel] = useState('');
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const educationTimelineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') return undefined;

    const root = document.querySelector('.portfolio-root');
    if (!root) return undefined;

    const elements = root.querySelectorAll<HTMLElement>(
      'main > div > div, section[id] .spotlight-card, section[id] article, #projects .project-delivery-scene, #skills .skill-flight-scene, #education .education-journey'
    );
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );

    elements.forEach((element) => {
      const siblingIndex = Array.from(element.parentElement?.children || []).indexOf(element);
      element.style.setProperty('--reveal-delay', `${Math.min(siblingIndex, 5) * 80}ms`);
      element.classList.add('scroll-reveal');
      observer.observe(element);
    });
    root.classList.add('motion-ready');

    return () => {
      observer.disconnect();
      root.classList.remove('motion-ready');
    };
  }, [prefersReducedMotion]);

  // Show the intro once per session and keep it short and skippable.
  useEffect(() => {
    if (!showPreloader) return undefined;
    if (prefersReducedMotion) {
      setShowPreloader(false);
      return undefined;
    }
    try {
      window.sessionStorage.setItem('ali-portfolio-intro-seen', 'true');
    } catch (_) {
      // The intro remains skippable if session storage is unavailable.
    }
    const timer = setTimeout(() => setShowPreloader(false), 900);
    return () => {
      clearTimeout(timer);
    };
  }, [prefersReducedMotion, showPreloader]);

  // Typewriter loop
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedLength(TYPING_PHRASES[0].length);
      return undefined;
    }

    const currentWord = TYPING_PHRASES[phraseIndex] || '';
    let delay = isDeleting ? 36 : 72;

    if (!isDeleting && typedLength === currentWord.length) {
      delay = 1400;
    } else if (isDeleting && typedLength === 0) {
      delay = 300;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && typedLength < currentWord.length) {
        setTypedLength((n) => n + 1);
      } else if (!isDeleting && typedLength === currentWord.length) {
        setIsDeleting(true);
      } else if (isDeleting && typedLength > 0) {
        setTypedLength((n) => n - 1);
      } else {
        setIsDeleting(false);
        setPhraseIndex((idx) => (idx + 1) % TYPING_PHRASES.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [phraseIndex, typedLength, isDeleting, prefersReducedMotion]);

  // Scroll progress, active nav link, and timeline fill
  useEffect(() => {
    let frameId: number | null = null;
    const updateScrollMetrics = () => {
      frameId = null;
      const doc = document.documentElement;
      const scrollable = Math.max((doc.scrollHeight - window.innerHeight) || 0, 1);
      const frac = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      setScrollFraction(frac);
      setShowBackToTop(window.scrollY > 400);

      if (!prefersReducedMotion && timelineContainerRef.current) {
        const rect = timelineContainerRef.current.getBoundingClientRect();
        const midViewport = window.innerHeight * 0.65;
        const progress = rect.height > 0
          ? Math.min(Math.max((midViewport - rect.top) / rect.height, 0), 1)
          : 0;
        setTimelineFillProgress(progress);
      }
      if (!prefersReducedMotion && educationTimelineContainerRef.current) {
        const rect = educationTimelineContainerRef.current.getBoundingClientRect();
        const midViewport = window.innerHeight * 0.65;
        const progress = rect.height > 0
          ? Math.min(Math.max((midViewport - rect.top) / rect.height, 0), 1)
          : 0;
        setEducationTimelineFillProgress(progress);
      }
    };

    const scheduleScrollMetrics = () => {
      if (frameId === null) frameId = requestAnimationFrame(updateScrollMetrics);
    };

    window.addEventListener('scroll', scheduleScrollMetrics, { passive: true });
    window.addEventListener('resize', scheduleScrollMetrics, { passive: true });
    scheduleScrollMetrics();

    return () => {
      window.removeEventListener('scroll', scheduleScrollMetrics);
      window.removeEventListener('resize', scheduleScrollMetrics);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const activeIds = new Set<string>();
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (section): section is HTMLElement => section !== null
    );
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activeIds.add(entry.target.id);
          else activeIds.delete(entry.target.id);
        });

        const active = sections
          .filter((section) => activeIds.has(section.id))
          .sort((a, b) => {
            const center = window.innerHeight * 0.32;
            return Math.abs(a.getBoundingClientRect().top - center) -
              Math.abs(b.getBoundingClientRect().top - center);
          })[0];
        setActiveSection(active?.id || '');
      },
      { rootMargin: '-22% 0px -63% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const navList = navListRef.current;
      const activeLink = navList?.querySelector<HTMLAnchorElement>(`a[href="#${activeSection}"]`);
      if (!navList || !activeLink || !activeSection) {
        setNavIndicator({ left: 0, width: 0 });
        return;
      }

      const listBounds = navList.getBoundingClientRect();
      const linkBounds = activeLink.getBoundingClientRect();
      setNavIndicator({
        left: linkBounds.left - listBounds.left,
        width: linkBounds.width,
      });
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator, { passive: true });
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSection]);

  // Spring-physics custom cursor on desktop pointer devices
  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined' || !window.matchMedia) return undefined;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!finePointer) return undefined;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let rafId: number | undefined;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const interactiveTarget =
        e.target instanceof Element ? e.target.closest('a, button, [role="button"], input, textarea, select') : null;
      setCursorLabel((current) => {
        if (interactiveTarget) return current || 'Open';
        return current === 'Open' ? '' : current;
      });
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
    };

    const animateRing = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(animateRing);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rafId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  // Escape key closes project modal
  useEffect(() => {
    if (!activeProject) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProject(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastText(message);
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  }, []);

  const skipIntro = () => {
    try {
      window.sessionStorage.setItem('ali-portfolio-intro-seen', 'true');
    } catch (_) {
      // Skipping still works when session storage is unavailable.
    }
    setShowPreloader(false);
  };

  const triggerConfetti = useCallback((origin?: ConfettiOrigin) => {
    setConfettiOrigin(origin || { x: window.innerWidth / 2, y: window.innerHeight * 0.42 });
    setConfettiBurstKey((key) => key + 1);
  }, []);

  const handleCopyEmail = async () => {
    const email = CONTACT_INFO.email;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
        showToast(`Copied ${email} to clipboard`);
        return;
      }
    } catch (_) {
      // Fallback below
    }

    const input = document.createElement('input');
    input.value = email;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast(`Copied ${email} to clipboard`);
    } catch (_) {
      showToast(`Email: ${email}`);
    }
    document.body.removeChild(input);
  };

  useEffect(() => {
    const sequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select'))
      ) {
        konamiKeysRef.current = [];
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const candidate = [...konamiKeysRef.current, key];
      let matchedLength = Math.min(candidate.length, sequence.length);
      while (
        matchedLength > 0 &&
        !sequence
          .slice(0, matchedLength)
          .every((expected, index) => candidate[candidate.length - matchedLength + index] === expected)
      ) {
        matchedLength -= 1;
      }

      konamiKeysRef.current = matchedLength ? candidate.slice(-matchedLength) : [];
      if (matchedLength && key.startsWith('Arrow')) event.preventDefault();
      if (matchedLength !== sequence.length) return;

      konamiKeysRef.current = [];
      triggerConfetti();
      showToast('Konami unlocked — developer mode activated!');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showToast, triggerConfetti]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return PROJECTS;
    return PROJECTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const categoryCounts = useMemo<Record<ProjectCategory, number>>(() => {
    return {
      All: PROJECTS.length,
      'Mobile app': PROJECTS.filter((p) => p.category === 'Mobile app').length,
      System: PROJECTS.filter((p) => p.category === 'System').length,
      'UI design': PROJECTS.filter((p) => p.category === 'UI design').length,
    };
  }, []);

  const typedText = (TYPING_PHRASES[phraseIndex] || '').slice(0, typedLength);

  return (
    <PortfolioErrorBoundary>
      <div className="portfolio-root min-h-screen bg-[#F8FAFC] dark:bg-[#05080D] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-cyan-400/30 selection:text-cyan-200 relative overflow-x-hidden transition-colors duration-300">
        {/* Component-scoped styles for spotlight glow, marquee, and kinetic typography */}
        <style>{`
          @keyframes marqueeLeft {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-marquee-left {
            animation: marqueeLeft 32s linear infinite;
          }
          .animate-marquee-right {
            animation: marqueeRight 36s linear infinite;
          }
          .animate-marquee-left:hover,
          .animate-marquee-right:hover {
            animation-play-state: paused;
          }
          .kinetic-gradient-text {
            background: linear-gradient(115deg, #22D3EE 0%, #818CF8 38%, #34D399 72%, #22D3EE 100%);
            background-size: 240% 240%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: gradientShift 7s ease-in-out infinite;
          }
          html[data-theme='dark'] .portfolio-root {
            background-color: #05080D !important;
            color: #E2E8F0 !important;
          }
          html[data-theme='light'] .portfolio-root {
            background-color: #F8FAFC !important;
            color: #0F172A !important;
          }
          html[data-theme='dark'] .portfolio-nav {
            background-color: rgba(11, 16, 27, 0.92) !important;
            border-color: rgba(255, 255, 255, 0.10) !important;
          }
          html[data-theme='light'] .portfolio-nav {
            background-color: rgba(255, 255, 255, 0.92) !important;
            border-color: rgba(226, 232, 240, 0.80) !important;
          }
          html[data-theme='dark'] .portfolio-mobile-menu {
            background-color: rgba(11, 16, 27, 0.97) !important;
            border-color: rgba(255, 255, 255, 0.10) !important;
            color: #CBD5E1;
          }
          html[data-theme='light'] .portfolio-mobile-menu {
            background-color: rgba(255, 255, 255, 0.97) !important;
            border-color: rgba(226, 232, 240, 0.90) !important;
            color: #334155;
          }
          @media (max-width: 767px) {
            header.fixed {
              top: max(0.75rem, env(safe-area-inset-top)) !important;
            }
          }
          .spotlight-card {
            position: relative;
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease;
          }
          .spotlight-card::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(34, 211, 238, 0.16), transparent 68%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
          }
          @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
            .spotlight-card:hover::before {
              opacity: 1;
            }
            .spotlight-card:hover {
              transform: translateY(-4px);
              border-color: rgba(34, 211, 238, 0.45);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-marquee-left,
            .animate-marquee-right,
            .kinetic-gradient-text {
              animation: none !important;
            }
            .spotlight-card,
            .spotlight-card::before {
              transition: none !important;
            }
          }
        `}</style>

        {/* Preloader Curtain */}
        {showPreloader && (
          <div
            className="intro-curtain fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#05080D] text-white"
          >
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-24 h-24 animate-spin" style={{ animationDuration: '2.8s' }} viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="aaRingGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <path d="M50 6 A44 44 0 0 1 94 50" stroke="url(#aaRingGrad)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="absolute font-bold text-xl tracking-wider kinetic-gradient-text">AA</span>
            </div>
            <p className="mt-4 font-mono text-xs tracking-[0.22em] uppercase text-slate-400">
              Loading {CONTACT_INFO.name}
            </p>
            <button
              type="button"
              onClick={skipIntro}
              className="intro-skip mt-8 rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-slate-400 transition-colors hover:border-cyan-400/50 hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              Skip intro
            </button>
          </div>
        )}

        {/* Custom Spring Cursor (Desktop Pointer) */}
        {!prefersReducedMotion && (
          <>
            <div
              ref={cursorDotRef}
              aria-hidden="true"
              className="hidden md:block fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 pointer-events-none z-[110] -translate-x-1/2 -translate-y-1/2"
            />
            <div
              ref={cursorRingRef}
              aria-hidden="true"
              className={`hidden md:flex fixed top-0 left-0 rounded-full border border-cyan-400/60 bg-cyan-400/10 backdrop-blur-[1px] items-center justify-center pointer-events-none z-[109] -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-200 ${
                cursorLabel ? 'w-[72px] h-[72px] bg-cyan-400/20 border-cyan-300' : 'w-10 h-10'
              }`}
            >
              {cursorLabel && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  {cursorLabel}
                </span>
              )}
            </div>
          </>
        )}

        {/* Top Scroll Progress Bar */}
        <div
          aria-hidden="true"
          style={{ transform: `scaleX(${scrollFraction})` }}
          className="fixed top-0 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 z-[95] pointer-events-none"
        />

        {showBackToTop && (
          <button
            type="button"
            aria-label="Back to top"
            title="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })}
            className="back-to-top-button fixed bottom-6 left-6 z-[90] grid h-12 w-12 place-items-center rounded-full border border-cyan-400/30 bg-white/90 text-cyan-600 shadow-lg shadow-cyan-500/10 backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-cyan-400 dark:bg-[#0B101B]/90 dark:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" />
              <circle
                className="back-to-top-progress"
                cx="24"
                cy="24"
                r="20"
                stroke="url(#backToTopGradient)"
                strokeDasharray="125.66"
                strokeDashoffset={125.66 * (1 - scrollFraction)}
                strokeLinecap="round"
                strokeWidth="2"
                transform="rotate(-90 24 24)"
              />
              <defs>
                <linearGradient id="backToTopGradient" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#22D3EE" />
                  <stop offset="0.55" stopColor="#818CF8" />
                  <stop offset="1" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>
            <svg className="back-to-top-arrow relative z-10 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-6 6 6-6 6 6" />
            </svg>
          </button>
        )}

        {/* Toast Notification */}
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[105] flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 text-white border border-cyan-400/40 shadow-2xl backdrop-blur-xl transition-all duration-300 pointer-events-none ${
            toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-sm font-medium">{toastText}</span>
        </div>

        <CommandPalette
          open={commandPaletteOpen}
          sections={NAV_ITEMS}
          isDark={isDark}
          reducedMotion={prefersReducedMotion}
          onClose={() => setCommandPaletteOpen(false)}
          onToggleTheme={toggleTheme}
          onCopyEmail={handleCopyEmail}
        />
        <ConfettiBurst
          burstKey={confettiBurstKey}
          origin={confettiOrigin}
          reducedMotion={prefersReducedMotion}
        />

        {/* Ambient Aurora Mesh Gradients */}
        <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="ambient-orb ambient-orb-cyan absolute -top-40 -right-24 w-[540px] h-[540px] rounded-full bg-cyan-500/15 dark:bg-cyan-500/20 blur-[130px]" />
          <div className="ambient-orb ambient-orb-indigo absolute top-[30%] -left-36 w-[500px] h-[500px] rounded-full bg-indigo-500/15 dark:bg-indigo-600/20 blur-[135px]" />
          <div className="ambient-orb ambient-orb-emerald absolute bottom-[-10%] right-[12%] w-[440px] h-[440px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[130px]" />
          <div className="ambient-grid absolute inset-0" />
        </div>

        {/* Floating Glass Navigation Bar */}
        <header className="fixed top-4 inset-x-0 z-50 px-3 sm:px-4">
          <nav
            aria-label="Primary Navigation"
            className="portfolio-nav max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full bg-white/85 dark:bg-[#0B101B]/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl"
          >
            <a
              href="#top"
              onMouseEnter={() => setCursorLabel('Top')}
              onMouseLeave={() => setCursorLabel('')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-md">
                AA
              </span>
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                Ali <span className="text-cyan-500">Akram</span>
              </span>
            </a>

            <ul
              ref={navListRef}
              className="relative hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              <span
                aria-hidden="true"
                className="nav-active-pill"
                style={{
                  width: `${navIndicator.width}px`,
                  transform: `translateX(${navIndicator.left}px)`,
                  opacity: navIndicator.width ? 1 : 0,
                }}
              />
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id} className="relative z-10">
                    <a
                      href={`#${item.id}`}
                      aria-current={isActive ? 'location' : undefined}
                      className={`relative z-10 px-3.5 py-1.5 rounded-full transition-colors ${
                        isActive
                          ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                          : 'hover:text-cyan-500 dark:hover:text-cyan-400'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                onMouseEnter={() => setCursorLabel('Theme')}
                onMouseLeave={() => setCursorLabel('')}
                aria-label="Toggle Light or Dark Theme"
                aria-pressed={isDark}
                title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
              >
                {isDark ? (
                  <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                aria-label="Open command palette"
                aria-keyshortcuts="Control+K Meta+K"
                title="Search commands (Ctrl/Cmd+K)"
                className="hidden lg:inline-flex h-9 items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/10 px-3 text-xs font-mono text-slate-500 dark:text-slate-400 hover:border-cyan-400/50 hover:text-cyan-500 transition-colors"
              >
                <span>Search</span>
                <kbd className="rounded border border-current/20 px-1.5 py-0.5">⌘ K</kbd>
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                onMouseEnter={() => setCursorLabel('Copy')}
                onMouseLeave={() => setCursorLabel('')}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 hover:brightness-110 transition-all active:scale-95"
              >
                <span>Copy Email</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={onEnableDrive}
                disabled={prefersReducedMotion}
                onMouseEnter={() => setCursorLabel('Drive Mode')}
                onMouseLeave={() => setCursorLabel('')}
                title={prefersReducedMotion ? 'Drive Mode is disabled while reduced motion is enabled' : 'Switch to Drive Mode'}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-950 bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300 hover:brightness-110 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span aria-hidden="true">🚗</span>
                <span>Drive Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle Menu"
                aria-expanded={mobileMenuOpen}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="portfolio-mobile-menu md:hidden max-w-5xl mx-auto mt-2 p-3 sm:p-4 rounded-3xl bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl">
              <div className="flex flex-col space-y-1 text-sm font-medium">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  type="button"
                  disabled={prefersReducedMotion}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnableDrive();
                  }}
                  className="px-4 py-2.5 rounded-xl text-left font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prefersReducedMotion ? 'Drive Mode unavailable with reduced motion' : 'Switch to Drive Mode'}
                </button>
                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyEmail();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400"
                  >
                    Copy Email ({CONTACT_INFO.email})
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <main
          id="top"
          onPointerMove={heroSpotlightMotion.onPointerMove}
          onPointerLeave={heroSpotlightMotion.onPointerLeave}
          className="hero-spotlight pt-32 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/85 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="font-mono text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  📍 {CONTACT_INFO.location}
                </span>
              </div>

              <div>
                <h1
                  data-shimmer-text="Ali Akram"
                  aria-label="Ali Akram"
                  className="heading-shimmer font-extrabold text-5xl sm:text-7xl xl:text-[5.25rem] tracking-tight leading-[1.02] text-slate-900 dark:text-white"
                >
                  <ScrambleText text="Ali" reducedMotion={prefersReducedMotion} />{' '}
                  <ScrambleText
                    text="Akram"
                    reducedMotion={prefersReducedMotion}
                    className="kinetic-gradient-text"
                  />
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <p className="font-bold text-xl sm:text-2xl text-slate-800 dark:text-slate-200">
                    {CONTACT_INFO.role}
                  </p>
                  <span className="font-mono text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/25">
                    iOS &amp; Android
                  </span>
                </div>
              </div>

              {/* Typewriter Role Line */}
              <div className="font-mono text-base sm:text-lg text-slate-600 dark:text-slate-400 min-h-[2rem] flex items-center gap-2">
                <span className="text-cyan-400 font-bold">$</span>
                <span>Building</span>
                <span className="font-semibold text-slate-900 dark:text-white">{typedText}</span>
                <span className="inline-block w-[2px] h-5 bg-cyan-400 animate-pulse" />
              </div>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                {CONTACT_INFO.lead}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <AnimatedBorder className="rounded-full" {...emailCtaMotion}>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    onMouseEnter={() => setCursorLabel('Email')}
                    onMouseLeave={() => setCursorLabel('')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Email me</span>
                  </a>
                </AnimatedBorder>

                <AnimatedBorder className="rounded-full" {...copyCtaMotion}>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    onMouseEnter={() => setCursorLabel('Copy')}
                    onMouseLeave={() => setCursorLabel('')}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 hover:border-cyan-400/60 transition-all"
                  >
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy Email</span>
                  </button>
                </AnimatedBorder>

                <a
                  href={CONTACT_INFO.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setCursorLabel('GitHub')}
                  onMouseLeave={() => setCursorLabel('')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 hover:border-indigo-400/60 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>View GitHub</span>
                </a>

                <a
                  href={CONTACT_INFO.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setCursorLabel('Connect')}
                  onMouseLeave={() => setCursorLabel('')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 hover:border-emerald-400/60 transition-all"
                >
                  <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <InteractivePhoneSimulator
                reducedMotion={prefersReducedMotion}
                onSetCursorLabel={setCursorLabel}
              />
            </div>
          </div>
        </main>

        {/* Dual-Direction Tech Marquee Strip */}
        <section
          aria-label="Technology Marquee"
          className="py-5 border-y border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-md overflow-hidden"
        >
          <Reveal className="space-y-2.5" reducedMotion={prefersReducedMotion}>
          <div className="flex w-max animate-marquee-left">
            <div className="flex items-center gap-8 px-4 font-bold text-base sm:text-lg">
              <span className="text-cyan-600 dark:text-cyan-400">React Native</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-indigo-600 dark:text-indigo-400">Redux Toolkit</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-amber-600 dark:text-amber-400">JavaScript</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-emerald-600 dark:text-emerald-400">Node.js</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-cyan-600 dark:text-cyan-400">SQL Server</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-emerald-600 dark:text-emerald-400">Firebase</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-sky-600 dark:text-sky-400">REST APIs</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-orange-600 dark:text-orange-400">Postman</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-violet-600 dark:text-violet-400">Google Play</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-slate-700 dark:text-slate-200">Git / GitHub</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-teal-600 dark:text-teal-400">Android Studio</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-blue-600 dark:text-blue-400">Google Cloud Console</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-rose-600 dark:text-rose-400">UI/UX</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
            </div>
            <div className="flex items-center gap-8 px-4 font-bold text-base sm:text-lg" aria-hidden="true">
              <span className="text-cyan-600 dark:text-cyan-400">React Native</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-indigo-600 dark:text-indigo-400">Redux Toolkit</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-amber-600 dark:text-amber-400">JavaScript</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-emerald-600 dark:text-emerald-400">Firebase</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-sky-600 dark:text-sky-400">REST APIs</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-orange-600 dark:text-orange-400">Postman</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-slate-700 dark:text-slate-200">Git / GitHub</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-teal-600 dark:text-teal-400">Android Studio</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-blue-600 dark:text-blue-400">Google Cloud Console</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
              <span className="text-rose-600 dark:text-rose-400">UI/UX</span>
              <span className="text-slate-300 dark:text-slate-700">✦</span>
            </div>
          </div>

          <div className="flex w-max animate-marquee-right opacity-80">
            <div className="flex items-center gap-8 px-4 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <span>Pixel-Perfect Screens</span>
              <span>•</span>
              <span>Reusable Components</span>
              <span>•</span>
              <span>Live REST APIs</span>
              <span>•</span>
              <span>Redux Toolkit State</span>
              <span>•</span>
              <span>Automated Finance Ledger</span>
              <span>•</span>
              <span>Booking &amp; Service Flows</span>
              <span>•</span>
            </div>
            <div className="flex items-center gap-8 px-4 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400" aria-hidden="true">
              <span>Pixel-Perfect Screens</span>
              <span>•</span>
              <span>Reusable Components</span>
              <span>•</span>
              <span>Live REST APIs</span>
              <span>•</span>
              <span>Redux Toolkit State</span>
              <span>•</span>
              <span>Automated Finance Ledger</span>
              <span>•</span>
              <span>Booking &amp; Service Flows</span>
              <span>•</span>
            </div>
          </div>
          </Reveal>
        </section>

        {/* About Me Section */}
        <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 scroll-mt-20">
          <Reveal className="max-w-6xl mx-auto" reducedMotion={prefersReducedMotion} stagger>
            <div className="mb-12">
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">01 / Profile</span>
              <h2 aria-label="About me" data-shimmer-text="About me" className="heading-shimmer mt-2 font-extrabold text-3xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
                About me
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div
                onPointerMove={spotlightMotion.onPointerMove}
                onPointerLeave={spotlightMotion.onPointerLeave}
                className="spotlight-card lg:col-span-7 p-7 sm:p-9 rounded-3xl bg-white/85 dark:bg-[#0B101B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between"
              >
                <div className="space-y-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">
                  {ABOUT_PARAGRAPHS.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center gap-2.5 relative z-10">
                  <span className="px-3 py-1 rounded-full font-mono text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20">
                    Pixel-Perfect UI
                  </span>
                  <span className="px-3 py-1 rounded-full font-mono text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                    Redux Toolkit
                  </span>
                  <span className="px-3 py-1 rounded-full font-mono text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                    Applied AI &amp; Data Analytics
                  </span>
                </div>
                <CodeTerminal code={ALI_PROFILE_CODE} reducedMotion={prefersReducedMotion} />
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4 sm:gap-5">
                {FACTS.map((fact) => (
                  <KpiFactCard key={fact.id} fact={fact} reducedMotion={prefersReducedMotion} />
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-200/70 dark:border-white/10 scroll-mt-20">
          <Reveal className="max-w-6xl mx-auto" reducedMotion={prefersReducedMotion} stagger>
            <div className="mb-12">
              <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">02 / Capabilities</span>
              <h2 aria-label="Skills" data-shimmer-text="Skills" className="heading-shimmer mt-2 font-extrabold text-3xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
                Skills
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" />
            </div>

            <div className="skill-flight-scene mb-8" aria-hidden="true">
              <div className="skill-flight-copy">
                <span className="skill-flight-kicker">SKILL STACK / IN MOTION</span>
                <span className="skill-flight-caption">Design <i /> Build <i /> Ship</span>
              </div>
              <div className="skill-flight-route">
                <span className="skill-flight-route-line" />
                <div className="skill-flight-runner">
                  <svg className="skill-flight-plane" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5c-.6 0-1 .4-1.2 1L8.7 10 2.4 13c-.4.2-.5.7-.3 1 .1.2.4.3.6.3l7-1.3.8 5-2.1 1.4c-.3.2-.4.6-.2.9.1.2.4.3.6.2l3.2-.9 3.2.9c.2.1.5 0 .6-.2.2-.3.1-.7-.2-.9l-2.1-1.4.8-5 7 1.3c.2 0 .5-.1.6-.3.2-.3.1-.8-.3-1L15.3 10l-2.1-6.5c-.2-.6-.6-1-1.2-1Z" />
                  </svg>
                  <span className="skill-flight-streak" />
                </div>
                <span className="skill-flight-endpoint">MOBILE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div
                onPointerMove={spotlightMotion.onPointerMove}
                onPointerLeave={spotlightMotion.onPointerLeave}
                className="spotlight-card lg:col-span-5 p-7 rounded-3xl bg-white/85 dark:bg-[#0B101B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">Core</h3>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-semibold">
                    Core Stack
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                  {CORE_SKILLS.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 border border-cyan-400/30 font-semibold text-sm text-slate-900 dark:text-white hover:border-cyan-400 transition-all"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                onPointerMove={spotlightMotion.onPointerMove}
                onPointerLeave={spotlightMotion.onPointerLeave}
                className="spotlight-card lg:col-span-7 p-7 rounded-3xl bg-white/85 dark:bg-[#0B101B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">Tools and practices</h3>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-semibold">
                    Workflow
                  </span>
                </div>
                <ul className="flex flex-wrap gap-3 relative z-10">
                  {TOOL_SKILLS.map((tool) => (
                    <li
                      key={tool}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-cyan-400/60 hover:text-cyan-600 dark:hover:text-cyan-300 font-medium text-sm transition-all"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Experience Timeline Section */}
        <section id="experience" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-200/70 dark:border-white/10 scroll-mt-20">
          <Reveal className="max-w-5xl mx-auto" reducedMotion={prefersReducedMotion} stagger>
            <div className="mb-14">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">03 / Career Track</span>
              <h2 aria-label="Experience" data-shimmer-text="Experience" className="heading-shimmer mt-2 font-extrabold text-3xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
                Experience
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
            </div>

            <div
              ref={timelineContainerRef}
              className="relative pl-6 sm:pl-10 border-l-2 border-slate-200 dark:border-white/10 space-y-10"
            >
              {/* Scroll-Driven Glowing Progress Line */}
              <div
                aria-hidden="true"
                style={{ transform: `scaleY(${prefersReducedMotion ? 1 : timelineFillProgress})` }}
                className="timeline-progress absolute left-[-2px] top-0 h-full w-[2px] bg-gradient-to-b from-cyan-400 via-indigo-500 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.75)] pointer-events-none"
              />

              {EXPERIENCES.map((job) => {
                const dotColor = {
                  cyan: 'bg-cyan-400',
                  indigo: 'bg-indigo-400',
                  emerald: 'bg-emerald-400',
                  amber: 'bg-amber-400',
                }[job.accent] || 'bg-cyan-400';

                const orgColor = {
                  cyan: 'text-cyan-600 dark:text-cyan-400',
                  indigo: 'text-indigo-600 dark:text-indigo-400',
                  emerald: 'text-emerald-600 dark:text-emerald-400',
                  amber: 'text-amber-600 dark:text-amber-400',
                }[job.accent] || 'text-cyan-600 dark:text-cyan-400';

                return (
                  <article key={job.id} className="relative">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[31px] sm:-left-[47px] top-6 h-3.5 w-3.5 rounded-full ${dotColor} ring-4 ring-white dark:ring-[#05080D]`}
                    />

                    <div
                      onPointerMove={spotlightMotion.onPointerMove}
                      onPointerLeave={spotlightMotion.onPointerLeave}
                      className="spotlight-card p-6 sm:p-8 rounded-3xl bg-white/85 dark:bg-[#0B101B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 relative z-10">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                              {job.role}
                            </h3>
                            {job.current && (
                              <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                                Current
                              </span>
                            )}
                          </div>
                          <p className={`font-semibold mt-1 ${orgColor}`}>{job.org}</p>
                        </div>

                        <time className="font-mono text-xs sm:text-sm px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                          {job.period}
                        </time>
                      </div>

                      <ul className="space-y-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 relative z-10">
                        {job.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-3">
                            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-200/70 dark:border-white/10 scroll-mt-20">
          <Reveal className="max-w-6xl mx-auto" reducedMotion={prefersReducedMotion} stagger>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">04 / Selected Work</span>
                <h2 aria-label="Projects" data-shimmer-text="Projects" className="heading-shimmer mt-2 font-extrabold text-3xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
                  Projects
                </h2>
                <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
              </div>

              {/* Filter Tabs */}
              <div
                role="tablist"
                aria-label="Filter projects by category"
                className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white/85 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 backdrop-blur-md"
              >
                {(['All', 'Mobile app', 'System', 'UI design'] as ProjectCategory[]).map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl font-mono text-xs transition-all ${
                        active
                          ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-semibold'
                      }`}
                    >
                      {cat} ({categoryCounts[cat]})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="project-delivery-scene mb-8" aria-hidden="true">
              <span className="delivery-caption">
                <span className="delivery-status-dot" />
                <span>PROJECT DROP</span>
                <span className="delivery-caption-note">Fresh work, on its way</span>
              </span>
              <div className="delivery-road">
                <span className="delivery-road-glow" />
              </div>
              <div className="delivery-runner">
                <div className="delivery-car">
                  <div className="delivery-cargo">
                    <span className="delivery-cargo-label">NEW</span>
                    <span className="delivery-cargo-mark">01</span>
                    <span className="delivery-cargo-lines" />
                  </div>
                  <div className="delivery-cabin">
                    <span className="delivery-window" />
                  </div>
                  <div className="delivery-chassis">
                    <span className="delivery-headlight" />
                  </div>
                  <span className="delivery-wheel delivery-wheel-back" />
                  <span className="delivery-wheel delivery-wheel-front" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const catStyle = {
                  'Mobile app': {
                    topBorder: 'border-t-cyan-400',
                    badge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
                    hoverTitle: 'group-hover:text-cyan-500 dark:group-hover:text-cyan-400',
                  },
                  System: {
                    topBorder: 'border-t-indigo-400',
                    badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
                    hoverTitle: 'group-hover:text-indigo-500 dark:group-hover:text-indigo-400',
                  },
                  'UI design': {
                    topBorder: 'border-t-rose-400',
                    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
                    hoverTitle: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
                  },
                }[project.category] || {
                  topBorder: 'border-t-cyan-400',
                  badge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
                  hoverTitle: 'group-hover:text-cyan-400',
                };

                return (
                  <TiltCard key={project.id} className="w-full" reducedMotion={prefersReducedMotion}>
                    <article
                      role="button"
                      tabIndex={0}
                      aria-haspopup="dialog"
                      onClick={() => setActiveProject(project)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setActiveProject(project);
                        }
                      }}
                      onPointerMove={spotlightMotion.onPointerMove}
                      onPointerLeave={spotlightMotion.onPointerLeave}
                      onMouseEnter={() => setCursorLabel('Inspect')}
                      onMouseLeave={() => setCursorLabel('')}
                      className={`spotlight-card group cursor-pointer p-6 rounded-3xl bg-white/85 dark:bg-[#0B101B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 border-t-4 ${catStyle.topBorder} flex flex-col justify-between min-h-[205px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400`}
                    >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="font-mono text-xs text-slate-400">
                          #{String(project.id + 1).padStart(2, '0')}
                        </span>
                        <span className={`font-mono text-xs font-semibold flex items-center gap-1 text-slate-400 ${catStyle.hoverTitle} transition-colors`}>
                          <span>Details</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                          </svg>
                        </span>
                      </div>
                      <h3 className={`font-bold text-xl text-slate-900 dark:text-white ${catStyle.hoverTitle} transition-colors`}>
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between relative z-10">
                      <span className={`px-3 py-1 rounded-full font-mono text-xs font-semibold ${catStyle.badge}`}>
                        {project.category}
                      </span>
                    </div>
                    </article>
                  </TiltCard>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/75 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                More code and demos on{' '}
                <a
                  href={CONTACT_INFO.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cyan-600 dark:text-cyan-400 underline decoration-cyan-400/50 underline-offset-4 hover:text-cyan-300"
                >
                  my GitHub
                </a>
                .
              </p>
              <a
                href={CONTACT_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setCursorLabel('GitHub')}
                onMouseLeave={() => setCursorLabel('')}
                className="inline-flex items-center gap-2 font-mono text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-opacity"
              >
                <span>github.com/ali-akram12</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </Reveal>
        </section>

        {/* Education Section */}
        <section id="education" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-200/70 dark:border-white/10 scroll-mt-20">
          <Reveal className="max-w-5xl mx-auto" reducedMotion={prefersReducedMotion} stagger>
            <div className="mb-12">
              <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">05 / Academic Background</span>
              <h2 aria-label="Education" data-shimmer-text="Education" className="heading-shimmer mt-2 font-extrabold text-3xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
                Education
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400" />
            </div>

            <div className="education-journey mb-8" aria-hidden="true">
              <div className="education-journey-copy">
                <span className="education-cap-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2 9 10-5 10 5-10 5L2 9Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 11v5c3.5 2.7 8.5 2.7 12 0v-5M22 9v6" />
                  </svg>
                </span>
                <span>
                  <span className="education-journey-title">A JOURNEY OF LEARNING</span>
                  <span className="education-journey-subtitle">Computer science to applied AI</span>
                </span>
              </div>
              <div className="education-journey-route">
                <span className="education-route-label education-route-label-first">PAKISTAN</span>
                <span className="education-route-label education-route-label-last">BRADFORD · ENGLAND</span>
                <svg className="education-flight-arc" viewBox="0 0 400 52" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="educationRouteGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  <path d="M20 42 C 112 4, 288 4, 380 42" />
                </svg>
                <span className="education-route-node education-route-node-first" />
                <span className="education-route-node education-route-node-last" />
                <div className="education-flight-runner">
                  <svg className="education-flight-plane" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5c-.6 0-1 .4-1.2 1L8.7 10 2.4 13c-.4.2-.5.7-.3 1 .1.2.4.3.6.3l7-1.3.8 5-2.1 1.4c-.3.2-.4.6-.2.9.1.2.4.3.6.2l3.2-.9 3.2.9c.2.1.5 0 .6-.2.2-.3.1-.7-.2-.9l-2.1-1.4.8-5 7 1.3c.2 0 .5-.1.6-.3.2-.3.1-.8-.3-1L15.3 10l-2.1-6.5c-.2-.6-.6-1-1.2-1Z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              ref={educationTimelineContainerRef}
              className="relative space-y-7 border-l-2 border-slate-200 dark:border-white/10 pl-6 sm:pl-10"
            >
              <div
                aria-hidden="true"
                style={{
                  transform: `scaleY(${prefersReducedMotion ? 1 : educationTimelineFillProgress})`,
                }}
                className="timeline-progress absolute left-[-2px] top-0 h-full w-[2px] bg-gradient-to-b from-indigo-400 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(99,102,241,0.7)] pointer-events-none"
              />
              {EDUCATION.map((edu) => {
                const accentClasses =
                  edu.accent === 'indigo'
                    ? 'border-l-indigo-400 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                    : 'border-l-cyan-400 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300';
                const [leftBorder, badgeStyle] =
                  edu.accent === 'indigo'
                    ? ['border-l-indigo-400', 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300']
                    : ['border-l-cyan-400', 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300'];

                return (
                  <article key={edu.id} className="relative">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[31px] sm:-left-[47px] top-6 h-3.5 w-3.5 rounded-full ring-4 ring-white dark:ring-[#05080D] ${
                        edu.accent === 'indigo' ? 'bg-indigo-400' : 'bg-cyan-400'
                      }`}
                    />
                    <div
                      onPointerMove={spotlightMotion.onPointerMove}
                      onPointerLeave={spotlightMotion.onPointerLeave}
                      className={`spotlight-card p-7 sm:p-8 rounded-3xl bg-white/85 dark:bg-[#0B101B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 border-l-4 ${leftBorder} flex flex-col justify-between`}
                    >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full font-mono text-xs font-semibold ${badgeStyle}`}>
                          {edu.badge}
                        </span>
                        <time className="font-mono text-xs text-slate-500 dark:text-slate-400">{edu.period}</time>
                      </div>
                      <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                        {edu.degree}
                      </h3>
                      <p className="mt-2 text-base font-medium text-slate-600 dark:text-slate-300">
                        {edu.institution}
                      </p>
                      {edu.dissertation && (
                        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          {edu.dissertation}
                        </p>
                      )}
                    </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6 scroll-mt-20">
          <Reveal className="max-w-5xl mx-auto" reducedMotion={prefersReducedMotion} stagger>
            <div className="relative overflow-hidden rounded-[2.25rem] p-8 sm:p-14 text-white bg-gradient-to-br from-cyan-600 via-indigo-600 to-[#0B101B] shadow-2xl border border-white/15">
              <div aria-hidden="true" className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />
              <div aria-hidden="true" className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-block font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-white/15 text-cyan-100 mb-4">
                  06 / Contact
                </span>
                <h2 aria-label="Let’s work together" data-shimmer-text="Let’s work together" className="heading-shimmer font-extrabold text-3xl sm:text-5xl tracking-tight">
                  Let’s work together
                </h2>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    onMouseEnter={() => setCursorLabel('Email')}
                    onMouseLeave={() => setCursorLabel('')}
                    className="font-bold text-xl sm:text-3xl md:text-4xl tracking-tight underline decoration-white/40 hover:decoration-white underline-offset-8 break-all transition-all"
                  >
                    {CONTACT_INFO.email}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    onMouseEnter={() => setCursorLabel('Copy')}
                    onMouseLeave={() => setCursorLabel('')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 font-mono text-xs font-semibold transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy Email</span>
                  </button>
                </div>

                <ul className="mt-10 pt-8 border-t border-white/20 flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base font-semibold">
                  <li>
                    <a
                      href={CONTACT_INFO.phoneHref}
                      onMouseEnter={() => setCursorLabel('Call')}
                      onMouseLeave={() => setCursorLabel('')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>{CONTACT_INFO.phone}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={CONTACT_INFO.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setCursorLabel('LinkedIn')}
                      onMouseLeave={() => setCursorLabel('')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <span>LinkedIn</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href={CONTACT_INFO.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setCursorLabel('GitHub')}
                      onMouseLeave={() => setCursorLabel('')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <span>GitHub</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </a>
                  </li>
                </ul>

              </div>
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 border-t border-slate-200/80 dark:border-white/10 text-center sm:text-left">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <p>{CONTACT_INFO.footer}</p>
            <p>React Native · Redux Toolkit · Applied AI &amp; Data Analytics</p>
          </div>
        </footer>

        {/* Project Case Study Modal */}
        {activeProject && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rn-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveProject(null);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl">
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                aria-label="Close modal"
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full font-mono text-xs font-semibold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                  {activeProject.category}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  PROJECT #{String(activeProject.id + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 id="rn-modal-title" className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {activeProject.title}
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeProject.description}
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
                <p className="font-mono text-[11px] uppercase tracking-wider text-cyan-500 font-semibold mb-2.5">
                  Highlights
                </p>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {activeProject.breakdown.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="flex flex-wrap gap-2">
                  {activeProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg font-mono text-xs bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={CONTACT_INFO.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  <span>View GitHub</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortfolioErrorBoundary>
  );
}

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const savedTheme = window.localStorage.getItem('ali-portfolio-theme');
      return savedTheme ? savedTheme === 'dark' : true;
    } catch (_) {
      return true;
    }
  });
  const [driveModeRequested, setDriveModeRequested] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('ali-portfolio-view-mode') === 'drive';
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    themeMeta?.setAttribute('content', isDark ? '#05080D' : '#F8FAFC');
    document.body.style.backgroundColor = isDark ? '#05080D' : '#F8FAFC';
    document.body.style.colorScheme = isDark ? 'dark' : 'light';
    try {
      window.localStorage.setItem('ali-portfolio-theme', isDark ? 'dark' : 'light');
    } catch (_) {
      // Theme selection remains available when storage is restricted.
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle('dark', nextIsDark);
    document.documentElement.setAttribute('data-theme', nextIsDark ? 'dark' : 'light');
    document.body.style.backgroundColor = nextIsDark ? '#05080D' : '#F8FAFC';
    document.body.style.colorScheme = nextIsDark ? 'dark' : 'light';
    try {
      window.localStorage.setItem('ali-portfolio-theme', nextIsDark ? 'dark' : 'light');
    } catch (_) {
      // Keep theme switching usable even if storage is unavailable.
    }
    setIsDark(nextIsDark);
  }, [isDark]);

  const setDriveMode = useCallback(
    (enabled: boolean) => {
      if (enabled && prefersReducedMotion) return;
      setDriveModeRequested(enabled);
      try {
        window.localStorage.setItem('ali-portfolio-view-mode', enabled ? 'drive' : 'classic');
      } catch (_) {
        // The selected mode still works for the current page view.
      }
    },
    [prefersReducedMotion]
  );

  if (driveModeRequested && !prefersReducedMotion) {
    return (
      <PortfolioErrorBoundary>
        <DriveMode
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onExitClassic={() => setDriveMode(false)}
        />
      </PortfolioErrorBoundary>
    );
  }

  return (
    <ClassicPortfolio
      prefersReducedMotion={prefersReducedMotion}
      isDark={isDark}
      toggleTheme={toggleTheme}
      onEnableDrive={() => setDriveMode(true)}
    />
  );
}